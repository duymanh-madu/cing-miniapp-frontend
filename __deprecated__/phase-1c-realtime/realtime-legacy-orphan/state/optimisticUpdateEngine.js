/**
 * =====================================================
 * OPTIMISTIC UPDATE ENGINE
 * =====================================================
 */

const optimisticTransactions =
  new Map();

export function applyOptimisticUpdate({

  transactionId,

  apply,

  rollback,

}) {

  optimisticTransactions.set(

    transactionId,

    {

      rollback,

      createdAt:
        Date.now(),

    }

  );

  apply();

}

export function completeOptimisticUpdate(

  transactionId

) {

  optimisticTransactions.delete(

    transactionId

  );

}

export function rollbackOptimisticUpdate(

  transactionId

) {

  const transaction =
    optimisticTransactions.get(

      transactionId

    );

  if (!transaction) {

    return;

  }

  transaction.rollback();

  optimisticTransactions.delete(

    transactionId

  );

}