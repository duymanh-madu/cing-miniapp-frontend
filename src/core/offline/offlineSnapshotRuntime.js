class OfflineSnapshotRuntime {

  SNAPSHOT_KEY =
    "cing_offline_snapshot";

  async restore() {

    try {

      const snapshot =
        localStorage.getItem(
          this.SNAPSHOT_KEY
        );

      if (!snapshot) {
        return;
      }

      return JSON.parse(
        snapshot
      );

    } catch (error) {

      console.error(
        "offline snapshot restore failed",
        error
      );

    }

  }

  persist(payload) {

    localStorage.setItem(
      this.SNAPSHOT_KEY,
      JSON.stringify(payload)
    );

  }

}

const offlineSnapshotRuntime =
  new OfflineSnapshotRuntime();

export default offlineSnapshotRuntime;