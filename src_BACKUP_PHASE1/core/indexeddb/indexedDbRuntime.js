class IndexedDbRuntime {

  db =
    null;

  async initialize() {

    return new Promise(
      (
        resolve,
        reject
      ) => {

        const request =
          indexedDB.open(
            "enterprise-runtime",
            1
          );

        request.onupgradeneeded =
          () => {

            this.db =
              request.result;

            this.db.createObjectStore(
              "runtime-cache",
              {
                keyPath:
                  "id",
              }
            );

          };

        request.onsuccess =
          () => {

            this.db =
              request.result;

            resolve(
              this.db
            );

          };

        request.onerror =
          reject;

      }
    );

  }

  async put({
    store,
    payload,
  }) {

    const tx =
      this.db.transaction(
        store,
        "readwrite"
      );

    tx.objectStore(
      store
    ).put(payload);

  }

  async get({
    store,
    id,
  }) {

    return new Promise(
      (
        resolve
      ) => {

        const tx =
          this.db.transaction(
            store,
            "readonly"
          );

        const request =
          tx
            .objectStore(
              store
            )
            .get(id);

        request.onsuccess =
          () => {

            resolve(
              request.result
            );

          };

      }
    );

  }

}

const indexedDbRuntime =
  new IndexedDbRuntime();

export default
  indexedDbRuntime;