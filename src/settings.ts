import { PluginConfig } from "./config";

export function getSettings(config: PluginConfig, onChange: (c: PluginConfig) => void) {
  return [
    {
      type: "text",
      title: "Last.fm Username",
      description: "Your Last.fm profile username",
      value: config.lastfmUser,
      onChange: (v: string) => onChange({ ...config, lastfmUser: v })
    },
    {
      type: "text",
      title: "Last.fm API Key",
      description: "Get it from last.fm/api/account/create",
      value: config.lastfmApiKey,
      onChange: (v: string) => onChange({ ...config, lastfmApiKey: v })
    },
    {
      type: "text",
      title: "Discord Application ID",
      description: "Application ID from Discord Developer Portal",
      value: config.discordClientId,
      onChange: (v: string) => onChange({ ...config, discordClientId: v })
    }
  ];
}
