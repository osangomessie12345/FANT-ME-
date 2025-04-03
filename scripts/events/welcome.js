const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.7",
		author: "NTKhang",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
		},
		en: {
			session1: "𝗺𝗼𝗿𝗻𝗶𝗻𝗴",
			session2: "𝗻𝗼𝗼𝗻",
			session3: "𝗮𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻",
			session4: "𝗲𝘃𝗲𝗻𝗶𝗻𝗴",
			welcomeMessage: "___________________________\n𝑗𝑒 𝑣𝑜𝑢𝑠 𝑟𝑒𝑚𝑒𝑟𝑐𝑖𝑒 𝑑𝑒 𝑚'𝑎𝑣𝑜𝑖𝑟 𝑟𝑎𝑗𝑜𝑢𝑡é 𝑝𝑎𝑟𝑚𝑖 𝑣𝑜𝑢𝑠 𝑗𝑒 𝑓𝑒𝑟𝑎𝑖 𝑑𝑒𝑐𝑚𝑜𝑛 𝑚𝑖𝑒𝑢𝑥 𝑝𝑜𝑢𝑟 𝑣𝑜𝑢𝑠 𝑠𝑎𝑡𝑖𝑠𝑓𝑎𝑖𝑟𝑒\n_________________________\n𝑚𝑜𝑛 𝑝𝑟𝑒𝑓𝑖𝑥 𝑒𝑠𝑡 (%1help)\n____________________________",
			multiple1: "𝘆𝗼𝘂",
			multiple2: "𝘆𝗼𝘂 𝗴𝘂𝘆𝘀",
			defaultWelcomeMessage: `𝑀𝐸𝑆𝑆𝐴𝐺𝐸 𝐏𝐎𝐔𝐑  {userName}\n_____________________\n𝑁𝑂𝑈𝑆 𝐓𝐄 𝑆𝑂𝑈𝐻𝐴𝐼𝑇𝑂𝑁𝑆 𝐿𝐴 𝐵𝐼𝐸𝑁𝑉𝐸𝑁𝑈𝐸 𝐃𝐀𝐍𝐒 𝐍𝐎𝐓𝐑𝐄 𝐆𝐑𝐎𝐔𝐏𝐄  : {boxName}\n_______________________\n𝑆𝑜𝑦𝑒𝑧 𝑙𝑒 𝑏𝑖𝑒𝑛𝑣𝑒𝑛𝑢(𝑒) 𝑑𝑎𝑛𝑠 𝑛𝑜𝑡𝑟𝑒 𝑔𝑟𝑜𝑢𝑝𝑒 𝑝𝑎𝑠𝑠𝑒𝑧 𝑢𝑛 𝑏𝑜𝑛 𝑆𝐸𝐽𝑂𝑈𝑅 𝑝𝑎𝑟𝑚𝑖 𝑛𝑜𝑢𝑠\n_________________________",`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}
				// if new member:
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				// push new member to array
				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				// if timeout is set, clear it
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				// set new timeout
				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;
					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [],
						mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId))
							continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}
					// {userName}:   name of new member
					// {multiple}:
					// {boxName}:    name of group
					// {threadName}: name of group
					// {session}:    session of day
					if (userName.length == 0) return;
					let { welcomeMessage = getLang("defaultWelcomeMessage") } =
						threadData.data;
					const form = {
						mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
					};
					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
						.replace(/\{boxName\}|\{threadName\}/g, threadName)
						.replace(
							/\{multiple\}/g,
							multiple ? getLang("multiple2") : getLang("multiple1")
						)
						.replace(
							/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
									? getLang("session2")
									: hours <= 18
										? getLang("session3")
										: getLang("session4")
						);

					form.body = welcomeMessage;

					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.reduce((acc, file) => {
							acc.push(drive.getFile(file, "stream"));
							return acc;
						}, []);
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}
					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
