import useRuntimeSchemaStore from "@/core/runtime-schema/runtimeSchemaStore";

class SchemaVersionManager {

  publish({
    key,
    schema,
    version,
  }) {

    const store =
      useRuntimeSchemaStore
        .getState();

    store.setActiveSchema(
      key,
      schema
    );

    store.setSchemaVersion(
      key,
      version
    );

  }

  resolveVersion(
    key
  ) {

    return useRuntimeSchemaStore
      .getState()
      .schemaVersions[
        key
      ];

  }

}

const schemaVersionManager =
  new SchemaVersionManager();

export default
  schemaVersionManager;