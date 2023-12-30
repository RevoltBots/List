module.exports = {
  name: "serverMemberJoin",
  execute(client, member) {
    const data = client.memberMap.get(member.server._id);
    if (data) return; // skip if member has been cached already
    data.push(member.id.user);
    client.memberMap.set(member.server._id, data);
  }
}
