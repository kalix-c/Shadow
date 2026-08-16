class AutoSeen {
  name = "ڤيو";
  author = "Thiệu Trung Kiên";
  cooldowns = 60;
  description = "انظر رسائل المستخدم!";
  role = "owner";
  aliases = ["رؤية"];
  config = false;
  async events({ api }) {
    this.config && api.markAsReadAll(() => {});
  }
  async execute() {
    this.config = this.config ? false : true;
    return kaguya.reply(`${this.config ? "✅" : "❌"} `);
  }
}

export default new AutoSeen();
