import indexedDbRuntime from "@/core/indexeddb/indexedDbRuntime";

class CachePersistenceRuntime {

  async persist({
    key,
    payload,
  }) {

    await indexedDbRuntime.put({

      store:
        "runtime-cache",

      payload: {

        id:
          key,

        payload,

      },

    });

  }

  async resolve(
    key
  ) {

    return indexedDbRuntime.get({

      store:
        "runtime-cache",

      id:
        key,

    });

  }

}

const cachePersistenceRuntime =
  new CachePersistenceRuntime();

export default
  cachePersistenceRuntime;