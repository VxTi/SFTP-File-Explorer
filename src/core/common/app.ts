import __events_declarations from '@/common/events.json';

export const EVENTS = __events_declarations;

export const App: Record<string, any> = {
    appName: 'Transference'
};

/**
 * Interface definition of an internal error
 */
export interface InternalError {
    /** The reason of the exception */
    reason: string;

    /**
     * Description of the exception (optional, if the reason is
     * descriptive enough, then this can be omitted
     */
    description?: string;
}