

import { Card, CardType, SceneTileData } from './types';

export const MEANS_CARDS: Card[] = [
  { id: 'm1', name: 'Dao găm', type: CardType.MEANS },
  { id: 'm2', name: 'Dao phẫu thuật', type: CardType.MEANS },
  { id: 'm3', name: 'Dao rọc giấy', type: CardType.MEANS },
  { id: 'm4', name: 'Dây thừng', type: CardType.MEANS },
  { id: 'm5', name: 'Dây đàn Piano', type: CardType.MEANS },
  { id: 'm6', name: 'Dây cước câu cá', type: CardType.MEANS },
  { id: 'm7', name: 'Cà vạt', type: CardType.MEANS },
  { id: 'm8', name: 'Khăn lụa', type: CardType.MEANS },
  { id: 'm9', name: 'Gối (làm ngạt)', type: CardType.MEANS },
  { id: 'm10', name: 'Túi nilon', type: CardType.MEANS },
  { id: 'm11', name: 'Súng giảm thanh', type: CardType.MEANS },
  { id: 'm12', name: 'Súng bắn đinh', type: CardType.MEANS },
  { id: 'm13', name: 'Nỏ / Mũi tên', type: CardType.MEANS },
  { id: 'm14', name: 'Thuốc độc Xyanua', type: CardType.MEANS },
  { id: 'm15', name: 'Thạch tín (Arsenic)', type: CardType.MEANS },
  { id: 'm16', name: 'Thuốc ngủ liều cao', type: CardType.MEANS },
  { id: 'm17', name: 'Insulin quá liều', type: CardType.MEANS },
  { id: 'm18', name: 'Khí CO', type: CardType.MEANS },
  { id: 'm19', name: 'Khí Gas rò rỉ', type: CardType.MEANS },
  { id: 'm20', name: 'Hóa chất ăn mòn', type: CardType.MEANS },
  { id: 'm21', name: 'Kim tiêm', type: CardType.MEANS },
  { id: 'm22', name: 'Búa đinh', type: CardType.MEANS },
  { id: 'm23', name: 'Rìu', type: CardType.MEANS },
  { id: 'm24', name: 'Gậy bóng chày', type: CardType.MEANS },
  { id: 'm25', name: 'Cục gạch', type: CardType.MEANS },
  { id: 'm26', name: 'Tượng đồng', type: CardType.MEANS },
  { id: 'm27', name: 'Chân nến kim loại', type: CardType.MEANS },
  { id: 'm28', name: 'Bàn là (Bàn ủi)', type: CardType.MEANS },
  { id: 'm29', name: 'Đá lạnh', type: CardType.MEANS },
  { id: 'm30', name: 'Nước (dìm chết)', type: CardType.MEANS },
  { id: 'm31', name: 'Lửa / Xăng', type: CardType.MEANS },
  { id: 'm32', name: 'Điện giật', type: CardType.MEANS },
  { id: 'm33', name: 'Xe hơi (tai nạn)', type: CardType.MEANS },
  { id: 'm34', name: 'Thang máy', type: CardType.MEANS },
  { id: 'm35', name: 'Rắn độc', type: CardType.MEANS },
  { id: 'm36', name: 'Vi khuẩn / Virus', type: CardType.MEANS },
  { id: 'm37', name: 'Tiếng ồn / Ánh sáng', type: CardType.MEANS },
  { id: 'm38', name: 'Thôi miên', type: CardType.MEANS },
];

export const EVIDENCE_CARDS: Card[] = [
  { id: 'e1', name: 'Vết máu', type: CardType.EVIDENCE },
  { id: 'e2', name: 'Dấu vân tay', type: CardType.EVIDENCE },
  { id: 'e3', name: 'Sợi tóc', type: CardType.EVIDENCE },
  { id: 'e4', name: 'Mẫu da / Móng tay', type: CardType.EVIDENCE },
  { id: 'e5', name: 'Nước bọt / ADN', type: CardType.EVIDENCE },
  { id: 'e6', name: 'Vết cắn', type: CardType.EVIDENCE },
  { id: 'e7', name: 'Kén bướm / Côn trùng', type: CardType.EVIDENCE },
  { id: 'e8', name: 'Lông thú cưng', type: CardType.EVIDENCE },
  { id: 'e9', name: 'Điện thoại di động', type: CardType.EVIDENCE },
  { id: 'e10', name: 'Laptop / Tablet', type: CardType.EVIDENCE },
  { id: 'e11', name: 'USB / Ổ cứng', type: CardType.EVIDENCE },
  { id: 'e12', name: 'Tin nhắn / Email xóa', type: CardType.EVIDENCE },
  { id: 'e13', name: 'Lịch sử duyệt web', type: CardType.EVIDENCE },
  { id: 'e14', name: 'Tệp ghi âm', type: CardType.EVIDENCE },
  { id: 'e15', name: 'Camera hành trình', type: CardType.EVIDENCE },
  { id: 'e16', name: 'Băng ghi hình CCTV', type: CardType.EVIDENCE },
  { id: 'e17', name: 'Nhật ký', type: CardType.EVIDENCE },
  { id: 'e18', name: 'Thư tuyệt mệnh', type: CardType.EVIDENCE },
  { id: 'e19', name: 'Hợp đồng bảo hiểm', type: CardType.EVIDENCE },
  { id: 'e20', name: 'Di chúc', type: CardType.EVIDENCE },
  { id: 'e21', name: 'Sổ tay / Mật mã', type: CardType.EVIDENCE },
  { id: 'e22', name: 'Vé tàu / Vé máy bay', type: CardType.EVIDENCE },
  { id: 'e23', name: 'Hóa đơn / Sao kê', type: CardType.EVIDENCE },
  { id: 'e24', name: 'Đồng hồ đeo tay', type: CardType.EVIDENCE },
  { id: 'e25', name: 'Nhẫn / Trang sức', type: CardType.EVIDENCE },
  { id: 'e26', name: 'Kính mắt / Kính râm', type: CardType.EVIDENCE },
  { id: 'e27', name: 'Khuy áo bị đứt', type: CardType.EVIDENCE },
  { id: 'e28', name: 'Khăn tay', type: CardType.EVIDENCE },
  { id: 'e29', name: 'Vết son môi', type: CardType.EVIDENCE },
  { id: 'e30', name: 'Mùi nước hoa', type: CardType.EVIDENCE },
  { id: 'e31', name: 'Găng tay cao su', type: CardType.EVIDENCE },
  { id: 'e32', name: 'Khẩu trang / Mặt nạ', type: CardType.EVIDENCE },
  { id: 'e33', name: 'Bùn đất', type: CardType.EVIDENCE },
  { id: 'e34', name: 'Phấn hoa / Cỏ dại', type: CardType.EVIDENCE },
  { id: 'e35', name: 'Cát / Sỏi', type: CardType.EVIDENCE },
  { id: 'e36', name: 'Tàn thuốc lá', type: CardType.EVIDENCE },
  { id: 'e37', name: 'Vỏ kẹo / Vỏ thuốc', type: CardType.EVIDENCE },
  { id: 'e38', name: 'Mảnh kính vỡ', type: CardType.EVIDENCE },
  { id: 'e39', name: 'Dấu lốp xe', type: CardType.EVIDENCE },
  { id: 'e40', name: 'Vết cạy cửa', type: CardType.EVIDENCE },
  { id: 'e41', name: 'Chìa khóa dự phòng', type: CardType.EVIDENCE },
];

export const CAUSE_OF_DEATH_TILE: SceneTileData = {
  id: 'cause_of_death',
  name: 'Nguyên Nhân Tử Vong',
  options: ['Ngạt thở', 'Mất máu', 'Chấn thương nặng', 'Trúng độc', 'Bệnh lý / Tự nhiên', 'Tai nạn'],
  selectedOptionIndex: null
};

export const LOCATION_TILES: SceneTileData[] = [
  { 
    id: 'loc_home', 
    name: 'Địa Điểm (Nhà Ở)', 
    options: ['Phòng khách', 'Phòng ngủ', 'Nhà bếp', 'Phòng tắm', 'Ban công', 'Vườn / Sân'], 
    selectedOptionIndex: null 
  },
  { 
    id: 'loc_urban', 
    name: 'Địa Điểm (Đô Thị)', 
    options: ['Trường học', 'Văn phòng', 'Bệnh viện', 'Quán Bar / Pub', 'Nhà hàng', 'Khách sạn'], 
    selectedOptionIndex: null 
  },
  { 
    id: 'loc_public', 
    name: 'Địa Điểm (Công Cộng)', 
    options: ['Công viên', 'Rừng cây', 'Bờ sông / Bãi biển', 'Công trường', 'Hiệu sách', 'Siêu thị'], 
    selectedOptionIndex: null 
  },
];

export const SCENE_TILES: SceneTileData[] = [
  // --- Thời Gian & Thời Tiết ---
  { 
    id: 'time_death', 
    name: 'Thời Gian Tử Vong', 
    options: ['Sáng sớm', 'Buổi sáng', 'Buổi trưa', 'Buổi chiều', 'Buổi tối', 'Đêm khuya'], 
    selectedOptionIndex: null 
  },
  { 
    id: 'duration', 
    name: 'Thời Gian Gây Án', 
    options: ['Tức thì', 'Vài phút', 'Vài giờ', 'Ngắn', 'Dài', 'Kéo dài nhiều ngày'], 
    selectedOptionIndex: null 
  },
  { 
    id: 'weather', 
    name: 'Thời Tiết', 
    options: ['Nắng', 'Mưa', 'Nhiều mây', 'Gió mạnh', 'Sương mù', 'Tuyết / Lạnh'], 
    selectedOptionIndex: null 
  },

  // --- Thi Thể & Nạn Nhân ---
  { 
    id: 'corpse_state', 
    name: 'Tình Trạng Thi Thể', 
    options: ['Còn ấm', 'Cứng đờ', 'Phân hủy', 'Không nguyên vẹn', 'Bị đốt cháy', 'Bầm tím'], 
    selectedOptionIndex: null 
  },
  { 
    id: 'clothes', 
    name: 'Trang Phục', 
    options: ['Gọn gàng', 'Xộc xệch', 'Sang trọng', 'Đồng phục', 'Đồ ngủ', 'Khỏa thân'], 
    selectedOptionIndex: null 
  },
  { 
    id: 'expression', 
    name: 'Biểu Cảm', 
    options: ['Bình thản', 'Hoảng sợ', 'Đau đớn', 'Tức giận', 'Ngạc nhiên', 'Vô hồn'], 
    selectedOptionIndex: null 
  },
  { 
    id: 'identity', 
    name: 'Thân Phận', 
    options: ['Trẻ em', 'Người già', 'Nam giới', 'Nữ giới', 'Người giàu', 'Vô gia cư'], 
    selectedOptionIndex: null 
  },
  { 
    id: 'build', 
    name: 'Kích Cỡ Cơ Thể', 
    options: ['Gầy', 'Béo', 'Cao', 'Thấp', 'Cơ bắp', 'Trung bình'], 
    selectedOptionIndex: null 
  },

  // --- Dấu Vết & Hành Động ---
  { 
    id: 'trace', 
    name: 'Dấu Vết', 
    options: ['Dấu chân', 'Dấu vân tay', 'Vết máu', 'Mùi lạ', 'Mảnh vỡ', 'Bụi bẩn'], 
    selectedOptionIndex: null 
  },
  { 
    id: 'scene_state', 
    name: 'Tình Trạng Hiện Trường', 
    options: ['Ngăn nắp', 'Lộn xộn', 'Giằng co', 'Đổ nát', 'Trống trơn', 'Cháy sém'], 
    selectedOptionIndex: null 
  },
  { 
    id: 'impression', 
    name: 'Ấn Tượng Chung', 
    options: ['Tàn bạo', 'Tinh vi', 'Vụng về', 'Có kế hoạch', 'Bộc phát', 'Kỳ quái'], 
    selectedOptionIndex: null 
  },
  { 
    id: 'motive', 
    name: 'Động Cơ', 
    options: ['Hận thù', 'Tình ái', 'Tiền bạc', 'Ghen tuông', 'Quyền lực', 'Biến thái'], 
    selectedOptionIndex: null 
  },
  { 
    id: 'relation', 
    name: 'Mối Quan Hệ', 
    options: ['Người yêu', 'Vợ chồng', 'Bạn bè', 'Đồng nghiệp', 'Kẻ thù', 'Người lạ'], 
    selectedOptionIndex: null 
  },
  { 
    id: 'social_env', 
    name: 'Trạng Thái Xã Hội', 
    options: ['Yên tĩnh', 'Ồn ào', 'Đông đúc', 'Vắng vẻ', 'Lễ hội', 'Hỗn loạn'], 
    selectedOptionIndex: null 
  },

  // --- NEW: SPECIAL TILES ---
  
  // Màu Cam: Hồ Sơ Tâm Lý
  {
    id: 'profile',
    name: 'Hồ Sơ Tâm Lý',
    options: ['Kẻ biến thái nhân cách', 'Kẻ bảo vệ / Hy sinh', 'Kẻ báo thù', 'Kẻ bốc đồng', 'Kẻ tính toán', 'Kẻ hoang tưởng'],
    selectedOptionIndex: null
  },

  // Màu Xám: Kết Quả Giám Định
  {
    id: 'report',
    name: 'Kết Quả Giám Định',
    options: ['Vết thương phòng vệ', 'Thi thể bị di chuyển', 'Dấu vết bị lau dọn', 'Thời gian bị làm giả', 'Mất bộ phận cơ thể', 'ADN hỗn tạp'],
    selectedOptionIndex: null
  },

  // Màu Đen: Thủ Thuật Gây Án
  {
    id: 'modus_operandi',
    name: 'Thủ Thuật Gây Án',
    options: ['Phòng kín', 'Bằng chứng ngoại phạm giả', 'Đánh tráo', 'Cạm bẫy từ xa', 'Cải trang / Đóng giả', 'Tạo hiện trường giả'],
    selectedOptionIndex: null
  },

  // Màu Hồng Nhạt: Bối Cảnh Xã Hội
  {
    id: 'social',
    name: 'Bối Cảnh Xã Hội',
    options: ['Tranh chấp tài sản / Thừa kế', 'Bí mật gia đình', 'Scandal nghề nghiệp', 'Bạo lực gia đình / Học đường', 'Tín ngưỡng / Tôn giáo', 'Mạng xã hội / Công nghệ'],
    selectedOptionIndex: null
  }
];

// --- Translations ---

export const TRANSLATIONS = {
  en: {
    appTitle: "DECEPTION",
    appSubtitle: "MURDER MYSTERY ONLINE",
    startTitle: "Server Lobby",
    createRoom: "Initialize Server",
    joinRoom: "Connect to Server",
    roomCode: "Server ID",
    startGame: "Execute Game",
    waitingForHost: "Awaiting MCP signal...",
    players: "Connected Agents",
    roles: "Assignments",
    settings: "Config",
    language: "Language",
    nightPhase: "Night Phase",
    murdererTurn: "Murderer's Turn",
    murdererInstruction: "Select 1 Weapon and 1 Evidence. You can choose from your own cards OR your Accomplice's cards, but BOTH must belong to the same person.",
    scientistNight: "The Murderer is choosing...",
    investigationPhase: "Investigation",
    votingPhase: "Decision Time",
    round: "Round",
    accuse: "Accuse",
    chat: "Encrypted Comms",
    weapon: "Weapon",
    evidence: "Evidence",
    badgeLost: "Badge Revoked",
    victoryPolice: "Investigators Win!",
    victoryMurderer: "Murderer Wins!",
    reasonCorrect: "The crime has been solved.",
    reasonWrong: "The investigators failed to find the truth.",
    reasonEscape: "All badges have been confiscated.",
    playAgain: "Return to Lobby",
    replaceTileTitle: "New Round - Replace a Tile",
    replaceTileInstruct: "Select ONE Scene Tile to remove. A new hint will take its place.",
    confirmCrime: "Commit Crime",
    confirmAccusation: "Confirm Accusation",
    cancel: "Cancel",
    youAre: "You are",
    roleScientist: "Forensic Scientist",
    roleMurderer: "Murderer",
    roleInvestigator: "Investigator",
    roleAccomplice: "Accomplice",
    roleWitness: "Witness",
    descScientist: "Guide the investigators with clues using Scene Tiles and Bullet Markers. Do not speak.",
    descMurderer: "Deceive everyone. You selected the Means and Evidence. Blend in.",
    descInvestigator: "Interpret the Forensic Scientist's clues to find the Murderer's cards. You have 1 Badge to accuse.",
    descAccomplice: "Help the Murderer distract the team. You know the solution.",
    descWitness: "You know who the Murderer and Accomplice are, but not the cards. Don't get caught!",
    causeOfDeath: "Cause of Death",
    location: "Location",
    hintBot: "AI Detective",
    send: "Send",
    typeMessage: "Type a message...",
    visualAnalysis: "Scan Evidence",
    settingsTitle: "Room Settings",
    maxPlayers: "Capacity",
    roundTime: "Round Time",
    seconds: "s",
    rolesConfig: "Special Roles",
    errorSameSet: "Rule Violation: Weapon and Evidence must belong to the SAME player!",
    yourCards: "Your Cards",
    accompliceCards: "Accomplice's Cards",
    roundInfo: "Round",
    nextRound: "End Round",
    finalRound: "Final Round",
    bulletMarker: "Wooden Bullet",
    discussionTime: "Discussion Time",
    overtime: "Final Decision",
    voteAccuse: "Accuse",
    votePass: "Pass",
    timeLeft: "Time Left",
    kick: "Kick",
    addPlayer: "Simulate Connection",
    waitingForPlayers: "Waiting for incoming connections...",
    // Guide Translations
    gameGuide: "Game Guide",
    howToPlay: "How To Play",
    cardGallery: "Card Gallery",
    rules: {
      intro: "This is a social deduction game of investigation and deception. Players assume the roles of investigators attempting to solve a murder case, but there is a killer hiding among them.",
      rolesTitle: "The Roles",
      roles: [
        { title: "Forensic Scientist (Host)", desc: "Knows the solution but CANNOT speak. Gives hints by placing markers on Scene Tiles." },
        { title: "Murderer", desc: "Selects the Weapon and Evidence. Tries to mislead the team and hide their guilt." },
        { title: "Investigators", desc: "Analyze clues and discuss to find the true criminal. Each has one badge to make a formal accusation." },
        { title: "Accomplice (Optional)", desc: "Knows the Murderer. Helps mislead the investigators." },
        { title: "Witness (Optional)", desc: "Knows who the culprits are but not the cards. If the Witness is identified by the Murderer at the end, the Murderer wins." }
      ],
      flowTitle: "Game Flow",
      flow: [
        { title: "1. The Crime", desc: "The Murderer secretly chooses 1 Weapon and 1 Evidence card." },
        { title: "2. Investigation (3 Rounds)", desc: "The Scientist places bullet markers on tiles to suggest details of the crime. Investigators discuss." },
        { title: "3. New Clues", desc: "After rounds 1 & 2, the Scientist replaces one tile with a new one for fresh information." },
        { title: "4. Accusation", desc: "Investigators can use their Badge to accuse. If they guess both cards correctly, the good guys win!" }
      ]
    }
  },
  vi: {
    appTitle: "KỲ ÁN",
    appSubtitle: "MẠNG TRỰC TUYẾN",
    startTitle: "Máy Chủ Phòng",
    createRoom: "Khởi Tạo Server",
    joinRoom: "Kết Nối Server",
    roomCode: "Mã Server",
    startGame: "Thực Thi Game",
    waitingForHost: "Đang chờ MCP kích hoạt...",
    players: "Kết nối",
    roles: "Vai trò",
    settings: "Cài đặt",
    language: "Ngôn ngữ",
    nightPhase: "Ban Đêm",
    murdererTurn: "Lượt Sát Nhân",
    murdererInstruction: "Chọn 1 Hung khí và 1 Vật chứng. Có thể chọn trong bộ bài của bạn HOẶC của Đồng phạm, nhưng cả 2 lá phải thuộc về CÙNG 1 người.",
    scientistNight: "Sát nhân đang hành động...",
    investigationPhase: "Điều Tra",
    votingPhase: "Quyết Định",
    round: "Vòng",
    accuse: "Buộc Tội",
    chat: "Kênh Mã Hóa",
    weapon: "Hung khí",
    evidence: "Vật chứng",
    badgeLost: "Mất Huy Hiệu",
    victoryPolice: "Cảnh Sát Thắng!",
    victoryMurderer: "Sát Nhân Thắng!",
    reasonCorrect: "Vụ án đã được phá giải thành công.",
    reasonWrong: "Các điều tra viên không tìm ra sự thật sau 3 vòng.",
    reasonEscape: "Tất cả huy hiệu đã bị thu hồi.",
    playAgain: "Về Sảnh Chờ",
    replaceTileTitle: "Vòng Mới - Thay Thẻ",
    replaceTileInstruct: "Pháp y chọn 1 Thẻ Hiện Trường cũ để bỏ đi. Thẻ mới sẽ thay thế vị trí đó.",
    confirmCrime: "Gây Án",
    confirmAccusation: "Xác Nhận",
    cancel: "Hủy",
    youAre: "Bạn là",
    roleScientist: "Pháp Y",
    roleMurderer: "Sát Nhân",
    roleInvestigator: "Điều Tra Viên",
    roleAccomplice: "Đồng Phạm",
    roleWitness: "Nhân Chứng",
    descScientist: "Dẫn dắt đội điều tra bằng các Thẻ Hiện Trường và Viên Đạn Gỗ. Tuyệt đối không được nói.",
    descMurderer: "Đánh lừa mọi người. Giấu bài đã chọn. Biết Đồng Phạm.",
    descInvestigator: "Giải mã manh mối từ Pháp Y để tìm Hung khí & Vật chứng. Bạn có 1 Huy Hiệu để buộc tội.",
    descAccomplice: "Bạn biết Hung thủ và đáp án. Giúp Hung thủ đánh lừa mọi người. Bạn không được nói thẳng đáp án nhưng có thể gợi ý khéo léo.",
    descWitness: "Bạn biết ai là Sát Nhân và Đồng Phạm. Đừng để bị bắt!",
    causeOfDeath: "Nguyên Nhân Tử Vong",
    location: "Hiện trường",
    hintBot: "Trợ Lý AI",
    send: "Gửi",
    typeMessage: "Nhập tin nhắn...",
    visualAnalysis: "Quét Vật Chứng",
    settingsTitle: "Thiết lập Server",
    maxPlayers: "Sức chứa",
    roundTime: "Thời gian thảo luận",
    seconds: "giây",
    rolesConfig: "Vai trò đặc biệt",
    errorSameSet: "Lỗi: Hung khí và Vật chứng phải thuộc về CÙNG 1 người!",
    yourCards: "Bài Của Bạn",
    accompliceCards: "Bài Đồng Phạm",
    roundInfo: "Vòng",
    nextRound: "Kết Thúc Vòng",
    finalRound: "Vòng Cuối",
    bulletMarker: "Viên Đạn Gỗ",
    discussionTime: "Thảo Luận",
    overtime: "Quyết Định",
    voteAccuse: "Kết Án",
    votePass: "Bỏ Qua",
    timeLeft: "Thời gian",
    kick: "Ngắt kết nối",
    addPlayer: "Giả lập Kết nối",
    waitingForPlayers: "Đang chờ tín hiệu kết nối...",
    // Guide Translations
    gameGuide: "Hồ Sơ Vụ Án & Luật Chơi",
    howToPlay: "Luật Chơi",
    cardGallery: "Danh Sách Thẻ Bài",
    rules: {
      intro: "Đây là trò chơi suy luận xã hội về điều tra và lừa dối. Người chơi đóng vai các điều tra viên cố gắng giải quyết một vụ giết người, nhưng có một kẻ sát nhân đang ẩn náu giữa họ.",
      rolesTitle: "Các Vai Trò",
      roles: [
        { title: "Pháp Y (Chủ phòng)", desc: "Biết đáp án nhưng KHÔNG ĐƯỢC NÓI. Chỉ đưa gợi ý bằng cách đặt viên đạn lên Thẻ Hiện Trường." },
        { title: "Sát Nhân", desc: "Chọn Hung khí và Vật chứng. Cố gắng đánh lạc hướng đội điều tra." },
        { title: "Điều Tra Viên", desc: "Phân tích gợi ý và thảo luận để tìm hung thủ. Mỗi người có 1 huy hiệu để buộc tội." },
        { title: "Đồng Phạm (Tùy chọn)", desc: "Biết Hung thủ và đáp án. Giúp đỡ Sát Nhân che giấu sự thật." },
        { title: "Nhân Chứng (Tùy chọn)", desc: "Biết ai là phe xấu nhưng không biết bài. Nếu cuối game Sát Nhân đoán đúng Nhân Chứng, Sát Nhân thắng." }
      ],
      flowTitle: "Diễn Biến",
      flow: [
        { title: "1. Gây Án", desc: "Sát nhân bí mật chọn 1 Hung khí và 1 Vật chứng." },
        { title: "2. Điều Tra (3 Vòng)", desc: "Pháp y đặt đạn lên thẻ để gợi ý chi tiết vụ án. Mọi người thảo luận." },
        { title: "3. Manh Mối Mới", desc: "Sau vòng 1 & 2, Pháp y bỏ 1 thẻ cũ và thay bằng 1 thẻ mới." },
        { title: "4. Phá Án", desc: "Điều tra viên có thể dùng Huy Hiệu để đoán. Nếu đúng cả Hung khí và Vật chứng, đội Điều tra thắng!" }
      ]
    }
  }
};
