export interface PluginConfig {
  lastfmUser: string;
  lastfmApiKey: string;
  discordClientId: string;
}

export const defaultConfig: PluginConfig = {
  lastfmUser: "",
  lastfmApiKey: "",
  discordClientId: ""
};
