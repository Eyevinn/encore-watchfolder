export interface Config {
  watchFolder: string;
  encoreParams: {
    profile: string;
    progressCallbackUri?: string;
    inputFolder?: string;
    outputFolder: string;
    url: string;
  };
}

export function readConfig(): Config {

  return {
    watchFolder: process.env.WATCH_FOLDER || 'watch',
    encoreParams: {
      profile: process.env.ENCORE_PROFILE || 'program',
      progressCallbackUri: process.env.ENCORE_CALLBACK_URL,
      inputFolder: process.env.ENCORE_INPUT_FOLDER,
      outputFolder: process.env.ENCORE_OUTPUT_FOLDER || 'out',
      url: process.env.ENCORE_URL || 'http://localhost:8080'
    }
  };
}