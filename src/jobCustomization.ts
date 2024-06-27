export interface JobCustomizerPlugin {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  customizeJob: (job: any) => any;
}

export let jobCustomizerPlugin: JobCustomizerPlugin | undefined;

export async function loadJobCustomizerPlugin(
  jobCustomizerPath?: string
): Promise<void> {
  if (!jobCustomizerPath) {
    return;
  }
  console.log(`Loading job customizer plugin from ${jobCustomizerPath}`);
  try {
    const module = await import(jobCustomizerPath);
    jobCustomizerPlugin = module as JobCustomizerPlugin;
  } catch (err) {
    console.error(
      `Failed to load job customizer module from ${jobCustomizerPath}`,
      err
    );
  }
}
