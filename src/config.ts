export interface Config {
  watchPatterns: WatchPattern[];
  subtitleSuffix?: string;
  encoreParams: {
    profile: string;
    progressCallbackUri?: string;
    inputFolder?: string;
    outputFolder: string;
    url: string;
    password?: string;
  };
}

export interface WatchPattern {
  pattern: string;
  profile?: string;
}

function readWatchPatterns(): { pattern: string; profile?: string }[] {
  const watchPatternsStr = process.env.WATCH_PATTERNS || 'watch/**/*.mp4';
  return watchPatternsStr.split(',').map((watchPatternStr) => {
    const [pattern, profile] = watchPatternStr.trim().split(':');
    return { pattern, profile };
  });
}

export function readConfig(): Config {
  return {
    watchPatterns: readWatchPatterns(),
    subtitleSuffix: process.env.SUBTITLES_SUFFIX,
    encoreParams: {
      profile: process.env.ENCORE_PROFILE || 'program',
      progressCallbackUri: process.env.ENCORE_CALLBACK_URL,
      inputFolder: process.env.ENCORE_INPUT_FOLDER,
      outputFolder: process.env.ENCORE_OUTPUT_FOLDER || 'out',
      url: process.env.ENCORE_URL || 'http://localhost:8080',
      password: process.env.ENCORE_PASSWORD
    }
  };
}
