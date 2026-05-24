import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

export async function bootstrapSafe({

  bootstrap,

  fallback,

}) {

  try {

    await bootstrap();

  } catch (error) {

    runtimeLogger.error("APP", 
      error
    );

    fallback?.();

  }

}