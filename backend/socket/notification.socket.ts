import { getIO } from "./socket";

export const sendNotification = (event: string,data: any
) => {
    const io = getIO();

    io.emit(event, data);
};