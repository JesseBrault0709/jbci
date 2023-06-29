import { ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { Writable } from 'stream'
import { Build, BuildEvents } from './Build'

export interface ChildProcessBuild {
    emit: <E extends keyof BuildEvents>(event: E, ...args: Parameters<BuildEvents[E]>) => boolean
    on: <E extends keyof BuildEvents>(event: E, listener: BuildEvents[E]) => this
}

export class ChildProcessBuild extends EventEmitter implements Build {
    constructor(private readonly child: ChildProcess) {
        super()
        if (child.stdout !== null) {
            child.stdout.on('data', chunk => {
                this.emit('log', 'OUT', chunk)
            })
        }
        if (child.stderr !== null) {
            child.stderr.on('data', chunk => {
                this.emit('log', 'ERROR', chunk)
            })
        }
        child.on('exit', (code, signal) => {
            if (code === 0) {
                this.emit('completed', 'SUCCESS')
            } else if (code !== null) {
                this.emit('completed', 'FAILURE')
            } else if (signal !== null) {
                this.emit('terminated', signal)
            } else {
                throw new Error('code and signal are both null')
            }
        })
    }

    pipeStdOut(target: Writable): boolean {
        if (this.child.stdout === null) {
            return false
        } else {
            this.child.stdout.pipe(target)
            return true
        }
    }

    pipeStdErr(target: Writable): boolean {
        if (this.child.stderr === null) {
            return false
        } else {
            this.child.stderr.pipe(target)
            return true
        }
    }
}
