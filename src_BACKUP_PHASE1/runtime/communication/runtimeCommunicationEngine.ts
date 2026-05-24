/**
 * =====================================================
 * RUNTIME COMMUNICATION
 * =====================================================
 */

const runtimeMessages:
  any[] = [];

/**
 * =====================================================
 * PUSH MESSAGE
 * =====================================================
 */

export function pushRuntimeMessage(

  payload: any

) {

  runtimeMessages.unshift({

    ...payload,

    created_at:
      Date.now(),

  });

}

/**
 * =====================================================
 * GET MESSAGES
 * =====================================================
 */

export function getRuntimeMessages() {

  return runtimeMessages;

}