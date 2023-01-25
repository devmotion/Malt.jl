using Logging
using Serialization
using Sockets

## Allow catching InterruptExceptions
Base.exit_on_sigint(false)

# ENV["JULIA_DEBUG"] = @__MODULE__

include("./MsgType.jl")

# ## TODO:
# ## * Don't use a global Logger. Use one for dev, and one for user code (handled by Pluto)
# ## * Define a worker specific LogLevel
# global_logger(ConsoleLogger(stderr, Logging.Debug))

function main()
    # Use the same port hint as Distributed
    port_hint = 9000 + (getpid() % 1000)
    port, server = listenany(port_hint)

    # Write port number to stdout to let main process know where to send requests
    @debug("WORKER: new port", port)
    println(stdout, port)
    flush(stdout)
    
    # Set network parameters, this is copied from Distributed
    Sockets.nagle(server, false)
    Sockets.quickack(server, true)

    serve(server)
end

function serve(server::Sockets.TCPServer)
    # FIXME: This `latest` task isn't a good hack.
    # It only works if the main server is disciplined about the order of requests.
    # That happens to be the case for Pluto, but it's not true in general.
    latest = nothing
    while isopen(server)
        try
            # Wait for new request
            client_connection = accept(server)
            @debug("New connection", client_connection)

            latest = @async while true
                # Set network parameters, this is copied from Distributed
                Sockets.nagle(client_connection, false)
                Sockets.quickack(client_connection, true)
                client_writer = Base.buffer_writes(client_connection)

                if !eof(client_connection)
                    
                    msg_type = read(client_connection, UInt8)
                    msg_id = read(client_connection, MsgID)
                    msg_data, success = try
                        deserialize(client_connection), true
                    catch err
                        err, false
                    finally
                        discard_until_boundary(client_connection)
                    end

                    if !success
                        continue
                    end

                    # TODO: msg boundary
                    # _discard_msg_boundary = deserialize(client_connection)
                    
                    if msg_type === MsgType.from_host_interrupt
                        interrupt(latest)
                    else
                        @debug("WORKER: Received message", msg_data)
                        handle(Val(msg_type), client_writer, msg_data, msg_id)
                        @debug("WORKER: handled")
                        
                    end
                end
            end
        catch e
            if e isa InterruptException
                @debug("WORKER: Caught interrupt!")
            else
                @error("WORKER: Caught exception!", exception=(e, backtrace()))
            end
            interrupt(latest)
            continue
        end
    end
    @debug("WORKER: Closed server socket. Bye!")
end

# Check if task is still running before throwing interrupt
interrupt(t::Task) = istaskdone(t) || Base.schedule(t, InterruptException(); error=true)
interrupt(::Nothing) = nothing


function discard_until_boundary(io::IO)
    readuntil(io, MSG_BOUNDARY)
end


"""
Low-level: send a message to the host.
"""
function _send_msg(host_socket, msg_type::UInt8, msg_id::MsgID, msg_data)
    # io = IOBuffer()
    io = host_socket
    lock(io)

    try
        write(io, msg_type)
        write(io, msg_id)
        serialize(io, msg_data)
        write(io, MSG_BOUNDARY)
        flush(io)
    finally
        unlock(io)
    end

    # serialize(host_socket, msg_data)
    # TODO: send msg boundary
    # serialize(host_socket, MSG_BOUNDARY)

    return nothing
end


function handle(::Val{MsgType.from_host_call_with_response}, socket, msg, msg_id::MsgID)
    f, args, kwargs, respond_with_nothing = msg
    
    success, result = try
        result = f(args...; kwargs...)
        
        # @debug("WORKER: Evaluated result", result)
        (true, respond_with_nothing ? nothing : result)
    catch e
        # @debug("WORKER: Got exception!", e)
        (false, e)
    end
    
    _send_msg(
        socket, 
        success ? MsgType.from_worker_call_result : MsgType.from_worker_call_failure, 
        msg_id, 
        result
    )
end


function handle(::Val{MsgType.from_host_call_without_response}, socket, msg, msg_id::MsgID)
    f, args, kwargs, _ignored = msg
    
    try
        f(args...; kwargs...)
    catch e
        @warn("WORKER: Got exception!", e)
        @debug("WORKER: Got exception!", e)
        # TODO: exception is ignored, is that what we want here?
    end
end





# function handle(::Val{:channel}, socket, msg, msg_id::MsgID)
#     channel = eval(msg.expr)
#     while isopen(channel) && isopen(socket)
#         serialize(socket, take!(channel))
#     end
#     isopen(socket) && close(socket)
#     isopen(channel) && close(channel)
#     return
# end

if abspath(PROGRAM_FILE) == @__FILE__
    main()
end

