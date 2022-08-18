var documenterSearchIndex = {"docs":
[{"location":"#Malt.jl","page":"Malt.jl","title":"Malt.jl","text":"","category":"section"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"Malt is a multiprocessing package for Julia. You can use Malt to create Julia processes, and to perform computations in those processes. Unlike the standard library package Distributed.jl, Malt is focused on process sandboxing, not distributed computing.","category":"page"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"Malt","category":"page"},{"location":"#Malt","page":"Malt.jl","title":"Malt","text":"The Malt module doesn't export anything, use qualified names instead. Internal functions are marked with a leading underscore, these functions are not stable.\n\n\n\n\n\n","category":"module"},{"location":"#Malt-workers","page":"Malt.jl","title":"Malt workers","text":"","category":"section"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"We call the Julia process that creates processes the manager, and the created processes are called workers. These workers communicate with the manager using the TCP protocol.","category":"page"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"Workers are isolated from one another by default. There's no way for two workers to communicate with one another, unless you set up a communication mechanism between them explicitly.","category":"page"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"Workers have separate memory, separate namespaces, and they can have separate project environments; meaning they can load separate packages, or different versions of the same package.","category":"page"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"Since workers are separate Julia processes, the number of workers you can create, and whether worker execution is multi-threaded will depend on your operating system.","category":"page"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"Malt.Worker","category":"page"},{"location":"#Malt.Worker","page":"Malt.jl","title":"Malt.Worker","text":"Malt.Worker()\n\nCreate a new Worker. A Worker struct is a handle to a (separate) Julia process.\n\nExamples\n\njulia> w = Malt.worker()\nMalt.Worker(0x0000, Process(`…`, ProcessRunning))\n\n\n\n\n\n","category":"type"},{"location":"#Calling-Functions","page":"Malt.jl","title":"Calling Functions","text":"","category":"section"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"The easiest way to execute code in a worker is with the remotecall* functions.","category":"page"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"Depending on the computation you want to perform, you might want to get the result synchronously or asynchronously; you might want to store the result or throw it away. The following table lists each function according to its scheduling and return value:","category":"page"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"Function Scheduling Return value\nMalt.remotecall Async <value>\nMalt.remote_do Async nothing\nMalt.remotecall_fetch Blocking <value>\nMalt.remotecall_wait Blocking nothing","category":"page"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"Malt.remotecall\nMalt.remote_do\nMalt.remotecall_fetch\nMalt.remotecall_wait","category":"page"},{"location":"#Malt.remotecall","page":"Malt.jl","title":"Malt.remotecall","text":"Malt.remotecall(f, w::Worker, args...; kwargs...)\n\nEvaluate f(args...; kwargs...) in worker w asynchronously. Returns a task that acts as a promise; the result value of the task is the result of the computation.\n\nThe function f must already be defined in the namespace of w.\n\nExamples\n\njulia> promise = Malt.remotecall(uppercase ∘ *, w, \"I \", \"declare \", \"bankruptcy!\");\n\njulia> fetch(promise)\n\"I DECLARE BANKRUPTCY!\"\n\n\n\n\n\n","category":"function"},{"location":"#Malt.remote_do","page":"Malt.jl","title":"Malt.remote_do","text":"Malt.remote_do(f, w::Worker, args...; kwargs...)\n\nEvaluate f(args...; kwargs...) in worker w asynchronously. Unlike remotecall, it discards the result of the computation, meaning there's no way to check if the computation was completed.\n\n\n\n\n\n","category":"function"},{"location":"#Malt.remotecall_fetch","page":"Malt.jl","title":"Malt.remotecall_fetch","text":"Malt.remotecall_fetch(f, w::Worker, args...; kwargs...)\n\nShorthand for fetch(Malt.remotecall(…)). Blocks and then returns the result of the remote call.\n\n\n\n\n\n","category":"function"},{"location":"#Malt.remotecall_wait","page":"Malt.jl","title":"Malt.remotecall_wait","text":"Malt.remotecall_wait(f, w::Worker, args...; kwargs...)\n\nShorthand for wait(Malt.remotecall(…)). Blocks and discards the resulting value.\n\n\n\n\n\n","category":"function"},{"location":"#Evaluating-expressions","page":"Malt.jl","title":"Evaluating expressions","text":"","category":"section"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"In some cases, evaluating functions is not enough. For example, importing modules alters the global state of the worker and can only be performed in the top level scope. For situations like this, you can evaluate code using the remote_eval* functions.","category":"page"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"Like the remotecall* functions, there's different a remote_eval* depending on the scheduling and return value.","category":"page"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"Malt.remote_eval\nMalt.remote_eval_fetch\nMalt.remote_eval_wait\nMalt.worker_channel","category":"page"},{"location":"#Malt.remote_eval","page":"Malt.jl","title":"Malt.remote_eval","text":"Malt.remote_eval([m], w::Worker, expr)\n\nEvaluate expression expr under module m on the worker w. If no module is specified, expr is evaluated under Main. Malt.remote_eval is asynchronous, like Malt.remotecall.\n\nThe module m and the type of the result of expr must be defined in both the main process and the worker.\n\nExamples\n\njulia> Malt.remote_eval(w, quote\n    x = \"x is a global variable\"\nend)\n\njulia> Malt.remote_eval_fetch(w, :x)\n\"x is a global variable\"\n\n\n\n\n\n","category":"function"},{"location":"#Malt.remote_eval_fetch","page":"Malt.jl","title":"Malt.remote_eval_fetch","text":"Shorthand for fetch(Malt.remote_eval(…)). Blocks and returns the resulting value.\n\n\n\n\n\n","category":"function"},{"location":"#Malt.remote_eval_wait","page":"Malt.jl","title":"Malt.remote_eval_wait","text":"Shorthand for wait(Malt.remote_eval(…)). Blocks and discards the resulting value.\n\n\n\n\n\n","category":"function"},{"location":"#Malt.worker_channel","page":"Malt.jl","title":"Malt.worker_channel","text":"Malt.worker_channel(w::Worker, expr)\n\nCreate a channel to communicate with worker w. expr must be an expression that evaluates to a Channel. expr should assign the Channel to a (global) variable so the worker has a handle that can be used to send messages back to the manager.\n\n\n\n\n\n","category":"function"},{"location":"#Signals-and-Termination","page":"Malt.jl","title":"Signals and Termination","text":"","category":"section"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"Once you're done computing with a worker, or if you find yourself in an unrecoverable situation (like a worker executing a divergent function), you'll want to terminate the worker.","category":"page"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"The ideal way to terminate a worker is to use the stop function, this will send a message to the worker requesting a graceful shutdown.","category":"page"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"Note that the worker process runs in the same process group as the manager, so if you send a signal to a manager, the worker will also get a signal.","category":"page"},{"location":"","page":"Malt.jl","title":"Malt.jl","text":"Malt.isrunning\nMalt.stop\nMalt.kill\nMalt.interrupt\nMalt.DeadWorkerException","category":"page"},{"location":"#Malt.isrunning","page":"Malt.jl","title":"Malt.isrunning","text":"Malt.isrunning(w::Worker)::Bool\n\nCheck whether the worker process w is running.\n\n\n\n\n\n","category":"function"},{"location":"#Malt.stop","page":"Malt.jl","title":"Malt.stop","text":"Malt.stop(w::Worker)\n\nTry to terminate the worker process w.\n\n\n\n\n\n","category":"function"},{"location":"#Malt.kill","page":"Malt.jl","title":"Malt.kill","text":"Malt.kill(w::Worker)\n\nTerminate the worker process w forcefully by sending a SIGTERM signal.\n\nThis is not the recommended way to terminate the process. See Malt.stop.\n\n\n\n\n\n","category":"function"},{"location":"#Malt.interrupt","page":"Malt.jl","title":"Malt.interrupt","text":"Malt.interrupt(w::Worker)\n\nSend an interrupt signal to the worker process. This will interrupt the latest request (remotecall* or remote_eval*) that was sent to the worker.\n\n\n\n\n\n","category":"function"},{"location":"#Malt.DeadWorkerException","page":"Malt.jl","title":"Malt.DeadWorkerException","text":"Malt will raise a DeadWorkerException when a remotecall is made to a Worker that has already been terminated.\n\n\n\n\n\n","category":"type"}]
}
