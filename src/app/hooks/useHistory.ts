// useHistory.ts
import { useState } from "react";

export function useHistory<T>(initialState: T) {
    const [past, setPast] = useState<T[]>([]);
    const [present, setPresent] = useState<T>(initialState);
    const [future, setFuture] = useState<T[]>([]);

    const set = (newState: T) => {
        // Prevent duplicate states (important for drag/move spam)
        if (JSON.stringify(newState) === JSON.stringify(present)) return;

        setPast((prev) => [...prev, present]);
        setPresent(newState);
        setFuture([]);
    };

    const undo = () => {
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setFuture((prev) => [present, ...prev]);
        setPast(newPast);
        setPresent(previous);
    };

    const redo = () => {
        if (future.length === 0) return;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast((prev) => [...prev, present]);
        setFuture(newFuture);
        setPresent(next);
    };

    return {
        state: present,
        set,
        undo,
        redo,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
    };
}