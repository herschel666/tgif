declare module 'claudia-bot-builder' {
    type MessageType =
        | 'facebook'
        | 'slack-slash-command'
        | 'skype'
        | 'telegram'
        | 'twilio'
        | 'alexa'
        | 'viber'
        | 'kik'
        | 'groupme';

    interface Options {
        platforms: string[];
    }

    interface OriginalRequest {
        update_id: number;
        message: {
            message_id: number;
            text: string;
            date: number;
        };
    }

    interface Message {
        text: string;
        type: MessageType;
        originalRequest: OriginalRequest;
    }

    interface TelegramStickerReply {
        method: 'sendSticker';
        body: string;
    }

    interface TelegramSticker {
        get(): TelegramStickerReply;
    }

    interface Templates {
        telegramTemplate: {
            Sticker: new (url: string) => TelegramSticker;
        };
    }

    interface BotBuilder {
        (callback: (message: Message) => string, options?: Options): void;
        (
            callback: (
                message: Message
            ) => Promise<TelegramStickerReply | string | null>,
            options?: Options
        ): void;
    }

    const claudiaBotbuilder: BotBuilder & Templates;

    export = claudiaBotbuilder;
}

declare namespace NodeJS {
    interface Global {
        dschiffCache: string[];
    }
}
