import pino from "pino";

const logger = pino({
    level: process.env.LOG_LEVEL || "info", // Set the default log level
    formatters: {
        level(label: string) {
            return { level: label };
        },
    },
    base: {
        pid: false, // Disable PID
        hostname: false, // Disable hostname
    },
    timestamp: pino.stdTimeFunctions.isoTime, // ISO timestamp
});

export default logger;
