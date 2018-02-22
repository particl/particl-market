import Io = require('socket.io');

export class CliIo {
    public tmp = 'AASDASDF';

    private io: Io;

    public getIo(): Io {
        return this.io;
    }

    public setIo(io: Io): void {
        this.io = io;
    }

    public emit(eventType: string, msg: string): void {
        this.io.emit(eventType, msg);
    }
}
