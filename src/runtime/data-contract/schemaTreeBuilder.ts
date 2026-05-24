class SchemaTreeBuilder {

  build(flatData: any) {

    const tree: any = {};

    Object.keys(flatData).forEach(path => {

      const parts = path.split(".");
      let current = tree;

      parts.forEach((part, index) => {

        if (!current[part]) {
          current[part] = index === parts.length - 1 ? flatData[path] : {};
        }

        current = current[part];

      });

    });

    return tree;

  }

}

export const schemaTreeBuilder = new SchemaTreeBuilder();
