import { contractExtractor } from "./contractExtractor";
import { schemaTreeBuilder } from "./schemaTreeBuilder";

class DataContractExplorer {

  private contracts: any[] = [];

  analyze(eventName: string, payload: any) {

    const extracted = contractExtractor.extract(eventName, payload);

    const tree = schemaTreeBuilder.build(extracted.fields);

    const contract = {
      event: eventName,
      flat: extracted.fields,
      tree,
      timestamp: Date.now(),
    };

    this.contracts.push(contract);

    return contract;

  }

  getAll() {
    return this.contracts;
  }

}

export const dataContractExplorer = new DataContractExplorer();
