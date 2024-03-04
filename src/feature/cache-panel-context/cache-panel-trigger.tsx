"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { useCachePanelContext } from "./cache-panel-context";

type Props = React.PropsWithChildren<
	React.ButtonHTMLAttributes<HTMLButtonElement>
>;

export function CachePanelTrigger(props: Props) {
	const { toggleOpen } = useCachePanelContext();
	return <Button variant="ghost" size="icon" onClick={toggleOpen} {...props} />;
}
