/**
 * =====================================================
 * ROLLBACK ENGINE
 * =====================================================
 */

const rollbackQueue =
  [];

export function registerRollback({

  transactionId,

  rollback,

}) {

  rollbackQueue.push({

    transactionId,

    rollback,

  });

}

export function executeRollback(

  transactionId

) {

  const target =
    rollbackQueue.find(

      (
        item
      ) =>

        item.transactionId ===
        transactionId

    );

  if (!target) {

    return false;

  }

  target.rollback();

  return true;

}