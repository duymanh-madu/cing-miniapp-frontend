import React from "react";

/**
 * =====================================================
 * CMS BLOCK
 * =====================================================
 */

interface RuntimeCmsBlock {

  type: string;

  title?: string;

  content?: string;

}

/**
 * =====================================================
 * CMS RENDERER
 * =====================================================
 */

interface Props {

  blocks:
    RuntimeCmsBlock[];

}

export default function RuntimeCmsRenderer({

  blocks,

}: Props) {

  return (

    <div className="flex flex-col gap-4">

      {

        blocks.map(

          (
            block,
            index
          ) => (

            <div

              key={index}

              className="
                rounded-2xl
                bg-white
                p-4
                shadow-sm
              "

            >

              <h2
                className="
                  text-lg
                  font-semibold
                "
              >

                {
                  block.title
                }

              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-gray-600
                "
              >

                {
                  block.content
                }

              </p>

            </div>

          )

        )

      }

    </div>

  );

}