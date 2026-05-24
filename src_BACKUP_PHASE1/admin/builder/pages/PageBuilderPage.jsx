import {
  useEffect,
} from "react";

import pageBuilderBootstrap from "../pageBuilderBootstrap";

import pageBuilderRealtimeSocket from "../pageBuilderRealtimeSocket";

import pageBuilderService from "../pageBuilderService";

import usePageBuilderStore from "../pageBuilderStore";

import PageCard from "../components/PageCard";

import VisualNodeEditor from "../components/VisualNodeEditor";

import RuntimePreviewPanel from "../components/RuntimePreviewPanel";

function PageBuilderPage() {

  const {

    pages,

    visualNodes,

    runtimePreview,

    setSelectedPage,

    setVisualNodes,

    setVisualEdges,

  } = usePageBuilderStore();

  useEffect(() => {

    pageBuilderBootstrap
      .bootstrap();

    pageBuilderRealtimeSocket
      .initialize();

  }, []);

  async function handleSelect(
    page
  ) {

    setSelectedPage(
      page
    );

    const graph =
      await pageBuilderService
        .getPageGraph(
          page.id
        );

    setVisualNodes(
      graph.nodes
    );

    setVisualEdges(
      graph.edges
    );

  }

  return (

    <div
      className="
        grid
        grid-cols-1
        gap-6
        xl:grid-cols-[320px_1fr]
      "
    >

      <div
        className="
          space-y-4
        "
      >

        {

          pages.map(
            (
              page
            ) => (

              <PageCard
                key={
                  page.id
                }

                page={
                  page
                }

                onSelect={
                  handleSelect
                }
              />

            )
          )

        }

      </div>

      <div
        className="
          space-y-6
        "
      >

        <VisualNodeEditor
          nodes={
            visualNodes
          }
        />

        <RuntimePreviewPanel
          runtimePreview={
            runtimePreview
          }
        />

      </div>

    </div>

  );

}

export default
  PageBuilderPage;