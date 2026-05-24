import schemaDesignerService from "./schemaDesignerService";

import useSchemaDesignerStore from "./schemaDesignerStore";

class SchemaDesignerBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const schemas =
      await schemaDesignerService
        .getSchemas();

    useSchemaDesignerStore
      .getState()
      .setSchemas(
        schemas
      );

    this.initialized =
      true;

  }

}

const schemaDesignerBootstrap =
  new SchemaDesignerBootstrap();

export default
  schemaDesignerBootstrap;