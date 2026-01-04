"use client";

import { PropsWithChildren, Dispatch, SetStateAction, useState, createContext, ReactNode, useContext } from "react";

export const ModalContext = createContext<
    [Array<ReactNode> | undefined, Dispatch<SetStateAction<Array<ReactNode> | undefined>>]
>({} as any);

export function ModalContextProvider({ children }: PropsWithChildren) {
    const [childrenState, setChildrenState] = useState<Array<ReactNode>>();
    return (
        <ModalContext.Provider value={[childrenState, setChildrenState]}>
            {children}
        </ModalContext.Provider>
    )
}

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) throw new Error("ModalContext could not be found");
    const [, setModal] = context;
    return function showModal(children: Array<ReactNode>) {
        setModal(children);
    }
}