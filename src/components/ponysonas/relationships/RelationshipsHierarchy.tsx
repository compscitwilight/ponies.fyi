"use client";

import { useEffect, createRef, useState, useMemo } from "react";
import Tree, { CustomNodeElementProps, Point } from "react-d3-tree";
import { Ponysona, PonysonaRelationship } from "@/generated/client";
import Link from "next/link";

function renderPonysonaNode(props: CustomNodeElementProps & { foreignObjectProps: any }) {
    console.log(props.nodeDatum)
    return (
        <g style={{
            width: 120,      // must have width
            height: 60,      // must have height
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white', // optional for visibility
            border: '2px solid black',
            borderRadius: '8px',
        }} className="text-center">
            <circle r={15}></circle>
            <foreignObject {...props.foreignObjectProps}>
                <div className="border border-gray-400/50 text-center bg-gray-300 rounded-md">
                    <img
                        className="w-[128px]"
                        src={`/api/ponysonas/${(props.nodeDatum.attributes as any).id}/preview`}
                    />
                    <Link
                        href={`/${(props.nodeDatum as any).id}?view=relationships`}
                        className="text-sky-600 underline font-bold"
                    >{props.nodeDatum.name}</Link>
                </div>
            </foreignObject>
        </g>
    )
}

export function RelationshipsHierarchy({
    ponysona,
    relations
}: {
    ponysona: Ponysona,
    relations: Array<PonysonaRelationship & { ponysonaA: Ponysona, ponysonaB: Ponysona }>
}) {
    const treeContainerRef = createRef<HTMLDivElement>();
    const [treeTranslate, setTreeTranslate] = useState<Point>({ x: 0, y: 0 });

    const visited = new Set<string>();
    const treeData = useMemo(() => buildNode(ponysona), [ponysona]);

    function buildNode(ponysona: Ponysona) {
        if (visited.has(ponysona.id)) return null as any;
        visited.add(ponysona.id);

        const connected = relations.flatMap((r) => {
            if (r.ponysonaAId === ponysona.id && r.ponysonaB) return [r.ponysonaB];
            if (r.ponysonaBId === ponysona.id && r.ponysonaA) return [r.ponysonaA];
            return [];
        })
            .filter(Boolean) as Array<Ponysona>;

        const children = connected.map(buildNode).filter(Boolean) as Array<any>;
        console.log(ponysona.slug)
        return {
            name: ponysona.primaryName,
            id: ponysona.slug,
            attributes: { id: ponysona.id },
            children: children.length > 0 ? children : undefined
        };
    }

    useEffect(() => {
        const id = requestAnimationFrame(() => {
            if (treeContainerRef.current === null) return;
            const dimensions = treeContainerRef.current.getBoundingClientRect();

            setTreeTranslate({
                x: dimensions.width / 2,
                y: dimensions.height / 2,
            });
        });

        return () => cancelAnimationFrame(id);
    }, [])

    return (
        <div
            ref={treeContainerRef}
            className="w-full h-[100vh]"
            id="treeWrapper"
        >
            <p>Note: Relationships graph is currently in beta and unexpected behavior may occur.</p>
            <Tree
                translate={treeTranslate}
                data={treeData}
                renderCustomNodeElement={(props: CustomNodeElementProps) => {
                    return renderPonysonaNode({
                        ...props,
                        foreignObjectProps: {
                            width: 100,
                            height: 300,
                            x: 10,
                            y: 15
                        }
                    });
                }}
                onNodeClick={(node) => {
                    const data = node.data as any;
                    if (data.id) window.location.assign(`/${data.id}?view=relationships`);
                    else alert("Failed to redirect");
                }}
            />
        </div>
    )
}