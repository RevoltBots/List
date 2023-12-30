module.exports = {
  name: "serverMemberLeave",
  execute(client, member) {
    const data = client.memberMap.get(member.server._id);
    if (!data) return; // skip if member is not cached for some reason
    const idx = data.findIndex(e => e == member.id.user);
    if (idx == -1) return;
    data.splice(idx, 1);
    client.memberMap.set(member.server._id, data);
  }
}
