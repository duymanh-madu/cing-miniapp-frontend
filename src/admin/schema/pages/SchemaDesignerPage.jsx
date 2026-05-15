import {
  useEffect,
} from "react";

import schemaDesignerBootstrap from "../schemaDesignerBootstrap";

import useSchemaDesignerStore from "../schemaDesignerStore";

import SchemaCard from "../components/SchemaCard";

import SchemaRuntimeViewer from "../components/SchemaRuntimeViewer";

function SchemaDesignerPage() {

  const {

    schemas,

    runtimeSchema,

    setSelectedSchema,

    setRuntimeSchema,

  } = useSchemaDesignerStore();

  useEffect(() => {

    schemaDesignerBootstrap
      .bootstrap();

  }, []);

  function handleSelect(
    schema
  ) {

    setSelectedSchema(
      schema
    );

    setRuntimeSchema(
      schema
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

          schemas.map(
            (
              schema
            ) => (

              <SchemaCard
                key={
                  schema.id
                }

                schema={
                  schema
                }

                onSelect={
                  handleSelect
                }
              />

            )
          )

        }

      </div>

      <SchemaRuntimeViewer
        runtimeSchema={
          runtimeSchema
        }
      />

    </div>

  );

}

export default
  SchemaDesignerPage;