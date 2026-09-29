"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useCachePanelContext } from "./cache-panel-context";

type Props = ButtonProps;

export function CachePanelTrigger(props: Props) {
	const { toggleOpen } = useCachePanelContext();
	return <Button variant="ghost" size="icon" onClick={toggleOpen} {...props} />;
}
