
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName("hidelink")
    .setDescription("Create a professional hidden link")
    .addStringOption(option =>
      option.setName("url")
        .setDescription("Website URL")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("label")
        .setDescription("Clickable link text")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("design")
        .setDescription("Choose your design")
        .setRequired(true)
        .addChoices(
          { name: "Classic", value: "classic" },
          { name: "Premium", value: "premium" }
        )
    )
].map(command => command.toJSON());

client.once("ready", async () => {
  console.log(`Devine Hidelink online as ${client.user.tag}`);

  const rest = new REST({ version: "10" })
    .setToken(process.env.DISCORD_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );

  console.log("Hidelink command registered!");
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "hidelink") return;

  const raw = interaction.options.getString("url");
  const label = interaction.options.getString("label") || "OPEN WEBSITE";
  const design = interaction.options.getString("design");

  let url;

  try {
    url = new URL(raw);

    if (!["https:", "http:"].includes(url.protocol) ||
        url.username || url.password) {
      throw new Error("Invalid URL");
    }
  } catch {
    return interaction.reply({
      content: "Please enter a valid HTTP or HTTPS URL.",
      ephemeral: true
    });
  }

  const premium = design === "premium";

  const embed = new EmbedBuilder()
    .setColor(premium ? 0x111318 : 0x5865F2)
    .setTitle(premium ? "✦ DEVINE PREMIUM" : "🔗 HIDELINK GENERATED")
    .setDescription(
      `**${label}**\n\n` +
      `[Click here to visit](${url.href})\n\n` +
      `**Destination:** \`${url.hostname}\`\n\n` +
      `**Copy Link:**\n\`\`\`\n${url.href}\n\`\`\``
    )
    .setFooter({
      text: "DEVINE BEAMZ • HIDELINK SYSTEM"
    })
    .setTimestamp();

  if (premium) {
    embed.setThumbnail(
      "https://cdn.discordapp.com/embed/avatars/5.png"
    );
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("OPEN LINK")
      .setStyle(ButtonStyle.Link)
      .setURL(url.href)
  );

  await interaction.reply({
    embeds: [embed],
    components: [row],
    allowedMentions: { parse: [] }
  });
});

client.login(process.env.DISCORD_TOKEN);
                                           
