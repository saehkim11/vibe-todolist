const loggedOutView = document.querySelector("#loggedOutView");
const loggedInView = document.querySelector("#loggedInView");
const loginTabButton = document.querySelector("#loginTabButton");
const signupTabButton = document.querySelector("#signupTabButton");
const loginPanel = document.querySelector("#loginPanel");
const signupPanel = document.querySelector("#signupPanel");
const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");
const loginButton = document.querySelector("#loginButton");
const signupButton = document.querySelector("#signupButton");
const logoutButton = document.querySelector("#logoutButton");
const accountMessage = document.querySelector("#accountMessage");
const configNotice = document.querySelector("#configNotice");
const currentUserName = document.querySelector("#currentUserName");
const currentUserEmail = document.querySelector("#currentUserEmail");
const currentTeamName = document.querySelector("#currentTeamName");
const currentUserRole = document.querySelector("#currentUserRole");
const teamPendingNotice = document.querySelector("#teamPendingNotice");
const workspaceView = document.querySelector("#workspaceView");
const workspaceSummary = document.querySelector("#workspaceSummary");
const teamTasksButton = document.querySelector("#teamTasksButton");
const myTasksButton = document.querySelector("#myTasksButton");
const taskDateFilter = document.querySelector("#taskDateFilter");
const taskStatusFilter = document.querySelector("#taskStatusFilter");
const refreshTasksButton = document.querySelector("#refreshTasksButton");
const taskListStatus = document.querySelector("#taskListStatus");
const taskGrid = document.querySelector("#taskGrid");
const newTaskButton = document.querySelector("#newTaskButton");
const taskEditorDialog = document.querySelector("#taskEditorDialog");
const taskEditorForm = document.querySelector("#taskEditorForm");
const taskEditorTitle = document.querySelector("#taskEditorTitle");
const editingTaskId = document.querySelector("#editingTaskId");
const taskTitleInput = document.querySelector("#taskTitleInput");
const taskDescriptionInput = document.querySelector("#taskDescriptionInput");
const taskDateInput = document.querySelector("#taskDateInput");
const taskAssigneeSelect = document.querySelector("#taskAssigneeSelect");
const taskEditorMessage = document.querySelector("#taskEditorMessage");
const saveTaskButton = document.querySelector("#saveTaskButton");
const closeTaskEditorButton = document.querySelector("#closeTaskEditorButton");
const cancelTaskEditorButton = document.querySelector("#cancelTaskEditorButton");
const taskProgressDialog = document.querySelector("#taskProgressDialog");
const taskProgressForm = document.querySelector("#taskProgressForm");
const progressTaskId = document.querySelector("#progressTaskId");
const progressTaskName = document.querySelector("#progressTaskName");
const taskProgressStatus = document.querySelector("#taskProgressStatus");
const taskMemoInput = document.querySelector("#taskMemoInput");
const taskProgressMessage = document.querySelector("#taskProgressMessage");
const saveTaskProgressButton = document.querySelector("#saveTaskProgressButton");
const closeTaskProgressButton = document.querySelector("#closeTaskProgressButton");
const cancelTaskProgressButton = document.querySelector("#cancelTaskProgressButton");
const taskDetailDialog = document.querySelector("#taskDetailDialog");
const closeTaskDetailButton = document.querySelector("#closeTaskDetailButton");
const taskDetailTitle = document.querySelector("#taskDetailTitle");
const detailTaskDate = document.querySelector("#detailTaskDate");
const detailTaskStatus = document.querySelector("#detailTaskStatus");
const detailTaskDescription = document.querySelector("#detailTaskDescription");
const detailTaskMemo = document.querySelector("#detailTaskMemo");
const commentCount = document.querySelector("#commentCount");
const commentListStatus = document.querySelector("#commentListStatus");
const commentList = document.querySelector("#commentList");
const commentForm = document.querySelector("#commentForm");
const editingCommentId = document.querySelector("#editingCommentId");
const commentInput = document.querySelector("#commentInput");
const commentFormMessage = document.querySelector("#commentFormMessage");
const cancelCommentEditButton = document.querySelector("#cancelCommentEditButton");
const saveCommentButton = document.querySelector("#saveCommentButton");
const notificationButton = document.querySelector("#notificationButton");
const notificationBadge = document.querySelector("#notificationBadge");
const notificationDialog = document.querySelector("#notificationDialog");
const closeNotificationButton = document.querySelector("#closeNotificationButton");
const markAllNotificationsButton = document.querySelector("#markAllNotificationsButton");
const notificationSummary = document.querySelector("#notificationSummary");
const notificationListStatus = document.querySelector("#notificationListStatus");
const notificationList = document.querySelector("#notificationList");

let authRenderNumber = 0;
let taskRequestNumber = 0;
let currentSession = null;
let currentProfile = null;
let currentTaskView = "team";
let loadedTasks = [];
let teamMembers = [];
let selectedTaskId = null;
let loadedComments = [];
let commentRequestNumber = 0;
let loadedNotifications = [];
let notificationRequestNumber = 0;

const taskStatusLabels = {
  start_before: "시작 전",
  in_progress: "진행 중",
  completed: "작업 완료"
};

function showMessage(message = "", type = "") {
  accountMessage.textContent = message;
  accountMessage.classList.toggle("is-error", type === "error");
  accountMessage.classList.toggle("is-success", type === "success");
}

function setButtonLoading(button, isLoading, loadingText, defaultText) {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : defaultText;
}

function selectAccountTab(tabName) {
  const isLogin = tabName === "login";

  loginPanel.hidden = !isLogin;
  signupPanel.hidden = isLogin;
  loginTabButton.classList.toggle("is-active", isLogin);
  signupTabButton.classList.toggle("is-active", !isLogin);
  loginTabButton.setAttribute("aria-selected", String(isLogin));
  signupTabButton.setAttribute("aria-selected", String(!isLogin));
  showMessage();

  const firstInput = isLogin
    ? document.querySelector("#loginEmail")
    : document.querySelector("#signupName");
  firstInput.focus();
}

async function loadCurrentProfile(userId) {
  const { data, error } = await sb
    .from("profiles")
    .select("display_name, team_id, is_leader, teams(name)")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

function formatTaskDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

function setTaskListStatus(message = "", isError = false) {
  taskListStatus.textContent = message;
  taskListStatus.classList.toggle("is-error", isError);
}

function setTaskEditorMessage(message = "", isError = false) {
  taskEditorMessage.textContent = message;
  taskEditorMessage.classList.toggle("is-error", isError);
  taskEditorMessage.classList.toggle("is-success", Boolean(message) && !isError);
}

function setTaskProgressMessage(message = "", isError = false) {
  taskProgressMessage.textContent = message;
  taskProgressMessage.classList.toggle("is-error", isError);
  taskProgressMessage.classList.toggle("is-success", Boolean(message) && !isError);
}

function setCommentFormMessage(message = "", isError = false) {
  commentFormMessage.textContent = message;
  commentFormMessage.classList.toggle("is-error", isError);
  commentFormMessage.classList.toggle("is-success", Boolean(message) && !isError);
}

function setCommentListStatus(message = "", isError = false) {
  commentListStatus.textContent = message;
  commentListStatus.classList.toggle("is-error", isError);
}

function setNotificationListStatus(message = "", isError = false) {
  notificationListStatus.textContent = message;
  notificationListStatus.classList.toggle("is-error", isError);
}

function clearTaskList() {
  taskRequestNumber += 1;
  loadedTasks = [];
  refreshTasksButton.disabled = false;
  taskGrid.replaceChildren();
  taskDateFilter.replaceChildren();

  const allDatesOption = document.createElement("option");
  allDatesOption.value = "all";
  allDatesOption.textContent = "전체 날짜";
  taskDateFilter.append(allDatesOption);
  taskStatusFilter.value = "all";
  setTaskListStatus();
  newTaskButton.hidden = true;
  notificationButton.hidden = true;
  notificationBadge.hidden = true;
  loadedNotifications = [];
  notificationList.replaceChildren();
  teamMembers = [];
}

async function loadTeamMembers() {
  if (!sb || !currentProfile?.team_id) {
    teamMembers = [];
    return;
  }

  const { data, error } = await sb
    .from("profiles")
    .select("id, display_name, is_leader")
    .eq("team_id", currentProfile.team_id)
    .order("is_leader", { ascending: false })
    .order("display_name", { ascending: true });

  if (error) {
    throw error;
  }

  teamMembers = data || [];
}

function fillAssigneeOptions(selectedUserId = "") {
  taskAssigneeSelect.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "담당자를 선택하세요";
  taskAssigneeSelect.append(placeholder);

  for (const member of teamMembers) {
    const option = document.createElement("option");
    option.value = member.id;
    option.textContent = member.is_leader
      ? `${member.display_name} (팀장)`
      : member.display_name;
    taskAssigneeSelect.append(option);
  }

  taskAssigneeSelect.value = selectedUserId;
}

async function openTaskEditor(task = null) {
  if (!currentProfile?.is_leader) {
    showMessage("업무 배정과 재배분은 팀장만 할 수 있습니다.", "error");
    return;
  }

  setTaskEditorMessage();
  saveTaskButton.disabled = true;

  try {
    await loadTeamMembers();

    if (teamMembers.length === 0) {
      throw new Error("같은 팀 구성원을 찾을 수 없습니다.");
    }

    editingTaskId.value = task?.id || "";
    taskEditorTitle.textContent = task ? "업무 수정·재배분" : "새 업무 배정";
    taskTitleInput.value = task?.title || "";
    taskDescriptionInput.value = task?.description || "";
    taskDateInput.value = task?.task_date || new Date().toISOString().slice(0, 10);
    fillAssigneeOptions(task?.assignee_id || currentSession.user.id);
    saveTaskButton.textContent = task ? "변경 내용 저장" : "업무 배정";
    saveTaskButton.disabled = false;

    if (!taskEditorDialog.open) {
      taskEditorDialog.showModal();
    }
    taskTitleInput.focus();
  } catch (error) {
    showMessage(`업무 창을 열지 못했습니다: ${error.message}`, "error");
  }
}

function closeTaskEditor() {
  if (taskEditorDialog.open) {
    taskEditorDialog.close();
  }
  taskEditorForm.reset();
  editingTaskId.value = "";
  setTaskEditorMessage();
}

function openTaskProgress(task) {
  if (!currentSession?.user || task.assignee_id !== currentSession.user.id) {
    showMessage("진행상황은 현재 업무 담당자만 변경할 수 있습니다.", "error");
    return;
  }

  progressTaskId.value = task.id;
  progressTaskName.textContent = task.title;
  taskProgressStatus.value = task.status;
  taskMemoInput.value = task.assignee_memo || "";
  setTaskProgressMessage();

  if (!taskProgressDialog.open) {
    taskProgressDialog.showModal();
  }
  taskProgressStatus.focus();
}

function closeTaskProgress() {
  if (taskProgressDialog.open) {
    taskProgressDialog.close();
  }
  taskProgressForm.reset();
  progressTaskId.value = "";
  progressTaskName.textContent = "";
  setTaskProgressMessage();
}

function formatCommentDate(dateText) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateText));
}

function updateNotificationBadge() {
  const unreadCount = loadedNotifications.filter((item) => !item.is_read).length;
  notificationBadge.textContent = String(unreadCount);
  notificationBadge.hidden = unreadCount === 0;
  notificationSummary.textContent = unreadCount > 0
    ? `읽지 않은 알림이 ${unreadCount}개 있습니다.`
    : "읽지 않은 알림이 없습니다.";
  markAllNotificationsButton.disabled = unreadCount === 0;
}

function renderNotifications() {
  notificationList.replaceChildren();
  updateNotificationBadge();

  if (loadedNotifications.length === 0) {
    setNotificationListStatus("완료 알림이 없습니다.");
    return;
  }

  setNotificationListStatus();
  const fragment = document.createDocumentFragment();

  for (const notification of loadedNotifications) {
    const button = document.createElement("button");
    button.className = "notification-item";
    button.classList.toggle("is-unread", !notification.is_read);
    button.type = "button";

    const message = document.createElement("span");
    message.className = "notification-message";
    message.textContent = notification.message;

    const meta = document.createElement("span");
    meta.className = "notification-meta";
    meta.textContent = `${formatCommentDate(notification.created_at)} · 관련 업무 열기`;

    button.append(message, meta);
    button.addEventListener("click", () => void openNotificationTask(notification));
    fragment.append(button);
  }

  notificationList.append(fragment);
}

async function loadNotifications() {
  if (!sb || !currentSession?.user || !currentProfile?.is_leader) {
    notificationButton.hidden = true;
    notificationBadge.hidden = true;
    loadedNotifications = [];
    return;
  }

  notificationButton.hidden = false;
  const requestNumber = ++notificationRequestNumber;

  const { data, error } = await sb
    .from("notifications")
    .select("id, task_id, message, is_read, created_at")
    .order("created_at", { ascending: false });

  if (requestNumber !== notificationRequestNumber) {
    return;
  }

  if (error) {
    loadedNotifications = [];
    updateNotificationBadge();
    setNotificationListStatus(`알림을 불러오지 못했습니다: ${error.message}`, true);
    return;
  }

  loadedNotifications = data || [];
  renderNotifications();
}

async function fetchTaskById(taskId) {
  const { data, error } = await sb
    .from("tasks")
    .select(`
      id,
      title,
      description,
      task_date,
      status,
      assignee_memo,
      completed_at,
      assignee_id,
      assignee:profiles!tasks_assignee_id_fkey(display_name)
    `)
    .eq("id", taskId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
}

async function openNotificationTask(notification) {
  try {
    if (!notification.is_read) {
      const { data, error } = await sb
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id)
        .eq("recipient_id", currentSession.user.id)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("읽음 처리할 알림을 찾을 수 없습니다.");
      }
    }

    const task = loadedTasks.find((item) => String(item.id) === String(notification.task_id))
      || await fetchTaskById(notification.task_id);

    await loadNotifications();

    if (!task) {
      throw new Error("관련 업무를 찾을 수 없습니다.");
    }

    if (notificationDialog.open) {
      notificationDialog.close();
    }
    openTaskDetail(task);
  } catch (error) {
    setNotificationListStatus(`알림을 처리하지 못했습니다: ${error.message}`, true);
  }
}

async function markAllNotificationsRead() {
  if (!currentSession?.user || !currentProfile?.is_leader) {
    return;
  }

  markAllNotificationsButton.disabled = true;

  try {
    const { error } = await sb
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", currentSession.user.id)
      .eq("is_read", false);

    if (error) {
      throw error;
    }
    await loadNotifications();
  } catch (error) {
    setNotificationListStatus(`알림을 읽음 처리하지 못했습니다: ${error.message}`, true);
  } finally {
    markAllNotificationsButton.disabled = false;
  }
}

function openNotificationDialog() {
  if (!currentProfile?.is_leader) {
    return;
  }
  if (!notificationDialog.open) {
    notificationDialog.showModal();
  }
  void loadNotifications();
}

function resetCommentForm() {
  editingCommentId.value = "";
  commentInput.value = "";
  saveCommentButton.textContent = "댓글 등록";
  cancelCommentEditButton.hidden = true;
  setCommentFormMessage();
}

function closeTaskDetail() {
  commentRequestNumber += 1;
  selectedTaskId = null;
  loadedComments = [];
  commentList.replaceChildren();
  commentCount.textContent = "0개";
  resetCommentForm();

  if (taskDetailDialog.open) {
    taskDetailDialog.close();
  }
}

function editComment(comment) {
  if (comment.user_id !== currentSession?.user?.id) {
    setCommentFormMessage("본인이 작성한 댓글만 수정할 수 있습니다.", true);
    return;
  }

  editingCommentId.value = comment.id;
  commentInput.value = comment.content;
  saveCommentButton.textContent = "댓글 수정";
  cancelCommentEditButton.hidden = false;
  setCommentFormMessage("댓글을 수정하고 있습니다.");
  commentInput.focus();
}

function renderComments() {
  commentList.replaceChildren();
  commentCount.textContent = `${loadedComments.length}개`;

  if (loadedComments.length === 0) {
    setCommentListStatus("아직 댓글이 없습니다. 첫 댓글을 남겨 보세요.");
    return;
  }

  setCommentListStatus();
  const fragment = document.createDocumentFragment();

  for (const comment of loadedComments) {
    const item = document.createElement("article");
    item.className = "comment-item";

    const meta = document.createElement("div");
    meta.className = "comment-meta";
    const author = document.createElement("strong");
    author.textContent = comment.author?.display_name || "작성자";
    const date = document.createElement("span");
    date.textContent = formatCommentDate(comment.created_at);
    meta.append(author, date);

    const content = document.createElement("p");
    content.className = "comment-content";
    content.textContent = comment.content;

    item.append(meta, content);

    if (comment.user_id === currentSession?.user?.id) {
      const actions = document.createElement("div");
      actions.className = "comment-actions";
      const editButton = document.createElement("button");
      editButton.className = "comment-action-button";
      editButton.type = "button";
      editButton.textContent = "수정";
      editButton.addEventListener("click", () => editComment(comment));
      const deleteButton = document.createElement("button");
      deleteButton.className = "comment-action-button";
      deleteButton.type = "button";
      deleteButton.textContent = "삭제";
      deleteButton.addEventListener("click", () => void deleteComment(comment));
      actions.append(editButton, deleteButton);
      item.append(actions);
    }

    fragment.append(item);
  }

  commentList.append(fragment);
}

async function loadComments(taskId) {
  const requestNumber = ++commentRequestNumber;
  commentList.replaceChildren();
  setCommentListStatus("댓글을 불러오는 중입니다.");

  const { data, error } = await sb
    .from("task_comments")
    .select(`
      id,
      task_id,
      user_id,
      content,
      created_at,
      updated_at,
      author:profiles!task_comments_user_id_fkey(display_name)
    `)
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (requestNumber !== commentRequestNumber || String(taskId) !== String(selectedTaskId)) {
    return;
  }

  if (error) {
    loadedComments = [];
    commentCount.textContent = "0개";
    setCommentListStatus(`댓글을 불러오지 못했습니다: ${error.message}`, true);
    return;
  }

  loadedComments = data || [];
  renderComments();
}

function openTaskDetail(task) {
  selectedTaskId = task.id;
  taskDetailTitle.textContent = task.title;
  detailTaskDate.textContent = formatTaskDate(task.task_date);
  detailTaskStatus.className = `status-badge status-${task.status}`;
  detailTaskStatus.textContent = taskStatusLabels[task.status] || task.status;
  detailTaskDescription.textContent = task.description;
  detailTaskMemo.textContent = task.assignee_memo || "등록된 담당자 메모가 없습니다.";
  detailTaskMemo.classList.toggle("is-empty", !task.assignee_memo);
  resetCommentForm();

  if (!taskDetailDialog.open) {
    taskDetailDialog.showModal();
  }
  void loadComments(task.id);
}

function updateDateFilter(tasks) {
  const selectedDate = taskDateFilter.value;
  const dates = [...new Set(tasks.map((task) => task.task_date))].sort();

  taskDateFilter.replaceChildren();

  const allDatesOption = document.createElement("option");
  allDatesOption.value = "all";
  allDatesOption.textContent = "전체 날짜";
  taskDateFilter.append(allDatesOption);

  for (const dateText of dates) {
    const option = document.createElement("option");
    option.value = dateText;
    option.textContent = formatTaskDate(dateText);
    taskDateFilter.append(option);
  }

  taskDateFilter.value = dates.includes(selectedDate) ? selectedDate : "all";
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";

  const header = document.createElement("div");
  header.className = "task-card-header";

  const date = document.createElement("span");
  date.className = "task-date";
  date.textContent = formatTaskDate(task.task_date);

  const status = document.createElement("span");
  status.className = `status-badge status-${task.status}`;
  status.textContent = taskStatusLabels[task.status] || task.status;

  header.append(date, status);

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const description = document.createElement("p");
  description.className = "task-description";
  description.textContent = task.description;

  const footer = document.createElement("div");
  footer.className = "task-card-footer";

  const assignee = document.createElement("p");
  assignee.className = "task-meta";
  const assigneeLabel = document.createTextNode("담당자 · ");
  const assigneeName = document.createElement("strong");
  assigneeName.textContent = task.assignee?.display_name || "담당자 확인 필요";
  assignee.append(assigneeLabel, assigneeName);
  footer.append(assignee);

  if (task.assignee_memo) {
    const memo = document.createElement("p");
    memo.className = "task-memo";
    memo.textContent = `메모 · ${task.assignee_memo}`;
    footer.append(memo);
  }

  if (currentSession?.user?.id === task.assignee_id) {
    const progressButton = document.createElement("button");
    progressButton.className = "task-progress-button";
    progressButton.type = "button";
    progressButton.textContent = "상태·메모 변경";
    progressButton.addEventListener("click", () => openTaskProgress(task));
    footer.append(progressButton);
  }

  if (currentProfile?.is_leader) {
    const editButton = document.createElement("button");
    editButton.className = "task-edit-button";
    editButton.type = "button";
    editButton.textContent = "업무 수정·재배분";
    editButton.addEventListener("click", () => void openTaskEditor(task));
    footer.append(editButton);
  }

  const detailButton = document.createElement("button");
  detailButton.className = "task-detail-button";
  detailButton.type = "button";
  detailButton.textContent = "상세·댓글";
  detailButton.addEventListener("click", () => openTaskDetail(task));
  footer.append(detailButton);

  card.append(header, title, description, footer);
  return card;
}

function renderFilteredTasks() {
  const selectedDate = taskDateFilter.value;
  const selectedStatus = taskStatusFilter.value;
  const filteredTasks = loadedTasks.filter((task) => {
    const matchesDate = selectedDate === "all" || task.task_date === selectedDate;
    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
    return matchesDate && matchesStatus;
  });

  taskGrid.replaceChildren();

  if (filteredTasks.length === 0) {
    setTaskListStatus("조건에 맞는 업무가 없습니다.");
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const task of filteredTasks) {
    fragment.append(createTaskCard(task));
  }
  taskGrid.append(fragment);

  const viewLabel = currentTaskView === "team" ? "팀 전체" : "내";
  setTaskListStatus(`${viewLabel} 업무 ${filteredTasks.length}개를 표시합니다.`);
}

async function loadTasks() {
  if (!sb || !currentSession?.user || !currentProfile?.team_id) {
    workspaceView.hidden = true;
    clearTaskList();
    return;
  }

  const requestNumber = ++taskRequestNumber;
  refreshTasksButton.disabled = true;
  taskGrid.replaceChildren();
  setTaskListStatus("업무를 불러오는 중입니다.");

  let query = sb
    .from("tasks")
    .select(`
      id,
      title,
      description,
      task_date,
      status,
      assignee_memo,
      completed_at,
      assignee_id,
      assignee:profiles!tasks_assignee_id_fkey(display_name)
    `)
    .order("task_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (currentTaskView === "mine") {
    query = query.eq("assignee_id", currentSession.user.id);
  }

  const { data, error } = await query;

  if (requestNumber !== taskRequestNumber) {
    return;
  }

  refreshTasksButton.disabled = false;

  if (error) {
    loadedTasks = [];
    updateDateFilter([]);
    setTaskListStatus(`업무를 불러오지 못했습니다: ${error.message}`, true);
    return;
  }

  loadedTasks = data || [];
  updateDateFilter(loadedTasks);
  renderFilteredTasks();
}

function selectTaskView(viewName) {
  currentTaskView = viewName;
  const isTeamView = viewName === "team";

  teamTasksButton.classList.toggle("is-active", isTeamView);
  myTasksButton.classList.toggle("is-active", !isTeamView);
  teamTasksButton.setAttribute("aria-selected", String(isTeamView));
  myTasksButton.setAttribute("aria-selected", String(!isTeamView));
  taskDateFilter.value = "all";
  taskStatusFilter.value = "all";
  void loadTasks();
}

async function saveTask(event) {
  event.preventDefault();

  if (!currentProfile?.is_leader || !currentSession?.user) {
    setTaskEditorMessage("업무 배정과 재배분은 팀장만 할 수 있습니다.", true);
    return;
  }

  const title = taskTitleInput.value.trim();
  const description = taskDescriptionInput.value.trim();
  const taskDate = taskDateInput.value;
  const assigneeId = taskAssigneeSelect.value;
  const taskId = editingTaskId.value;

  if (!title || !description || !taskDate || !assigneeId) {
    setTaskEditorMessage("업무명, 설명, 날짜, 담당자를 모두 입력해 주세요.", true);
    return;
  }

  const selectedMember = teamMembers.find((member) => member.id === assigneeId);
  if (!selectedMember) {
    setTaskEditorMessage("같은 팀 구성원만 담당자로 선택할 수 있습니다.", true);
    return;
  }

  const previousTask = taskId
    ? loadedTasks.find((task) => String(task.id) === String(taskId))
    : null;

  if (
    previousTask &&
    previousTask.assignee_id !== assigneeId &&
    !window.confirm(
      `${previousTask.assignee?.display_name || "기존 담당자"}님에서 ${selectedMember.display_name}님으로 업무를 재배분하시겠습니까?\n기존 상태와 담당자 메모는 유지됩니다.`
    )
  ) {
    return;
  }

  saveTaskButton.disabled = true;
  setTaskEditorMessage("저장 중입니다.");

  try {
    let result;

    if (taskId) {
      result = await sb
        .from("tasks")
        .update({
          title,
          description,
          task_date: taskDate,
          assignee_id: assigneeId
        })
        .eq("id", taskId)
        .select("id")
        .maybeSingle();
    } else {
      result = await sb
        .from("tasks")
        .insert({
          team_id: currentProfile.team_id,
          title,
          description,
          task_date: taskDate,
          assignee_id: assigneeId
        })
        .select("id")
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    if (!result.data) {
      throw new Error("저장된 업무를 확인할 수 없습니다. 권한을 확인해 주세요.");
    }

    closeTaskEditor();
    showMessage(taskId ? "업무가 수정되었습니다." : "업무가 배정되었습니다.", "success");
    await loadTasks();
    if (currentProfile?.is_leader) {
      await loadNotifications();
    }
  } catch (error) {
    setTaskEditorMessage(`업무를 저장하지 못했습니다: ${error.message}`, true);
  } finally {
    saveTaskButton.disabled = false;
  }
}

async function saveTaskProgress(event) {
  event.preventDefault();

  if (!currentSession?.user) {
    setTaskProgressMessage("로그인 상태를 확인할 수 없습니다.", true);
    return;
  }

  const taskId = progressTaskId.value;
  const task = loadedTasks.find((item) => String(item.id) === String(taskId));
  const status = taskProgressStatus.value;
  const assigneeMemo = taskMemoInput.value.trim();

  if (!task || task.assignee_id !== currentSession.user.id) {
    setTaskProgressMessage("현재 담당자만 진행상황을 변경할 수 있습니다.", true);
    return;
  }

  if (!Object.hasOwn(taskStatusLabels, status)) {
    setTaskProgressMessage("올바른 진행 상태를 선택해 주세요.", true);
    return;
  }

  if (
    status === "completed" &&
    task.status !== "completed" &&
    !window.confirm("작업 완료로 변경하시겠습니까? 팀장에게 완료 알림이 전달됩니다.")
  ) {
    return;
  }

  saveTaskProgressButton.disabled = true;
  setTaskProgressMessage("저장 중입니다.");

  try {
    const { data, error } = await sb
      .from("tasks")
      .update({
        status,
        assignee_memo: assigneeMemo
      })
      .eq("id", taskId)
      .eq("assignee_id", currentSession.user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("변경된 업무가 없습니다. 현재 담당자를 확인해 주세요.");
    }

    closeTaskProgress();
    showMessage("업무 진행상황이 저장되었습니다.", "success");
    await loadTasks();
    if (currentProfile?.is_leader) {
      await loadNotifications();
    }
  } catch (error) {
    setTaskProgressMessage(`진행상황을 저장하지 못했습니다: ${error.message}`, true);
  } finally {
    saveTaskProgressButton.disabled = false;
  }
}

async function saveComment(event) {
  event.preventDefault();

  if (!selectedTaskId || !currentSession?.user) {
    setCommentFormMessage("업무 또는 로그인 상태를 확인할 수 없습니다.", true);
    return;
  }

  const content = commentInput.value.trim();
  const commentId = editingCommentId.value;

  if (!content) {
    setCommentFormMessage("댓글 내용을 입력해 주세요.", true);
    return;
  }

  saveCommentButton.disabled = true;
  setCommentFormMessage("저장 중입니다.");

  try {
    let result;

    if (commentId) {
      result = await sb
        .from("task_comments")
        .update({ content })
        .eq("id", commentId)
        .eq("user_id", currentSession.user.id)
        .select("id")
        .maybeSingle();
    } else {
      result = await sb
        .from("task_comments")
        .insert({ task_id: selectedTaskId, content })
        .select("id")
        .single();
    }

    if (result.error) {
      throw result.error;
    }
    if (!result.data) {
      throw new Error("저장된 댓글을 확인할 수 없습니다.");
    }

    resetCommentForm();
    await loadComments(selectedTaskId);
  } catch (error) {
    setCommentFormMessage(`댓글을 저장하지 못했습니다: ${error.message}`, true);
  } finally {
    saveCommentButton.disabled = false;
  }
}

async function deleteComment(comment) {
  if (comment.user_id !== currentSession?.user?.id) {
    setCommentFormMessage("본인이 작성한 댓글만 삭제할 수 있습니다.", true);
    return;
  }

  if (!window.confirm("이 댓글을 삭제하시겠습니까?")) {
    return;
  }

  try {
    const { data, error } = await sb
      .from("task_comments")
      .delete()
      .eq("id", comment.id)
      .eq("user_id", currentSession.user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error("삭제된 댓글이 없습니다.");
    }

    if (String(editingCommentId.value) === String(comment.id)) {
      resetCommentForm();
    }
    await loadComments(selectedTaskId);
  } catch (error) {
    setCommentFormMessage(`댓글을 삭제하지 못했습니다: ${error.message}`, true);
  }
}

async function renderAuthState(session) {
  const renderNumber = ++authRenderNumber;
  const user = session?.user ?? null;
  currentSession = session;

  loggedOutView.hidden = Boolean(user);
  loggedInView.hidden = !user;

  if (!user) {
    currentProfile = null;
    workspaceView.hidden = true;
    clearTaskList();
    currentUserName.textContent = "사용자";
    currentUserEmail.textContent = "";
    currentTeamName.textContent = "팀 배정 대기";
    currentUserRole.textContent = "팀원";
    teamPendingNotice.hidden = true;
    return;
  }

  currentUserName.textContent = user.user_metadata?.display_name || "사용자";
  currentUserEmail.textContent = user.email || "";
  currentTeamName.textContent = "확인 중";
  currentUserRole.textContent = "확인 중";
  teamPendingNotice.hidden = true;

  try {
    const profile = await loadCurrentProfile(user.id);

    if (renderNumber !== authRenderNumber) {
      return;
    }

    if (!profile) {
      currentProfile = null;
      workspaceView.hidden = true;
      newTaskButton.hidden = true;
      currentTeamName.textContent = "프로필 확인 필요";
      currentUserRole.textContent = "확인 필요";
      showMessage("사용자 프로필을 찾을 수 없습니다.", "error");
      return;
    }

    currentUserName.textContent = profile.display_name;
    currentTeamName.textContent = profile.teams?.name || "팀 배정 대기";
    currentUserRole.textContent = profile.is_leader ? "팀장" : "팀원";
    teamPendingNotice.hidden = Boolean(profile.team_id);
    currentProfile = profile;
    workspaceView.hidden = !profile.team_id;
    newTaskButton.hidden = !profile.team_id || !profile.is_leader;
    notificationButton.hidden = !profile.team_id || !profile.is_leader;

    if (profile.team_id) {
      workspaceSummary.textContent = `${profile.teams?.name || "소속 팀"}의 업무를 확인합니다.`;
      void loadTasks();
      if (profile.is_leader) {
        void loadNotifications();
      }
    } else {
      clearTaskList();
    }
  } catch (error) {
    if (renderNumber !== authRenderNumber) {
      return;
    }

    currentTeamName.textContent = "불러오기 실패";
    currentUserRole.textContent = "확인 필요";
    showMessage(`프로필을 불러오지 못했습니다: ${error.message}`, "error");
    currentProfile = null;
    workspaceView.hidden = true;
    clearTaskList();
  }
}

async function handleLogin(event) {
  event.preventDefault();

  if (!sb) {
    showMessage("config.js에 Supabase 연결 정보를 먼저 입력해 주세요.", "error");
    return;
  }

  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  setButtonLoading(loginButton, true, "로그인 중...", "로그인");
  showMessage();

  try {
    const { error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }

    loginForm.reset();
    showMessage("로그인되었습니다.", "success");
  } catch (error) {
    showMessage(`로그인하지 못했습니다: ${error.message}`, "error");
  } finally {
    setButtonLoading(loginButton, false, "로그인 중...", "로그인");
  }
}

async function handleSignup(event) {
  event.preventDefault();

  if (!sb) {
    showMessage("config.js에 Supabase 연결 정보를 먼저 입력해 주세요.", "error");
    return;
  }

  const formData = new FormData(signupForm);
  const displayName = String(formData.get("displayName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const passwordConfirm = String(formData.get("passwordConfirm") || "");

  if (!displayName) {
    showMessage("이름을 입력해 주세요.", "error");
    return;
  }

  if (password !== passwordConfirm) {
    showMessage("비밀번호와 비밀번호 확인이 일치하지 않습니다.", "error");
    return;
  }

  setButtonLoading(signupButton, true, "가입 중...", "회원가입");
  showMessage();

  try {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    });

    if (error) {
      throw error;
    }

    signupForm.reset();

    if (data.session) {
      showMessage("회원가입되었습니다. 팀 배정을 기다려 주세요.", "success");
    } else {
      selectAccountTab("login");
      showMessage("회원가입되었습니다. 이메일 확인 후 로그인해 주세요.", "success");
    }
  } catch (error) {
    showMessage(`회원가입하지 못했습니다: ${error.message}`, "error");
  } finally {
    setButtonLoading(signupButton, false, "가입 중...", "회원가입");
  }
}

async function handleLogout() {
  if (!sb) {
    return;
  }

  logoutButton.disabled = true;
  showMessage();

  try {
    const { error } = await sb.auth.signOut();

    if (error) {
      throw error;
    }

    showMessage("로그아웃되었습니다.", "success");
  } catch (error) {
    showMessage(`로그아웃하지 못했습니다: ${error.message}`, "error");
  } finally {
    logoutButton.disabled = false;
  }
}

async function initializeAuth() {
  if (!sb) {
    configNotice.hidden = false;
    loginButton.disabled = true;
    signupButton.disabled = true;
    return;
  }

  const { data, error } = await sb.auth.getSession();

  if (error) {
    showMessage(`로그인 상태를 확인하지 못했습니다: ${error.message}`, "error");
  } else {
    await renderAuthState(data.session);
  }

  sb.auth.onAuthStateChange((_event, session) => {
    // 인증 콜백 안에서는 추가 Supabase 요청을 기다리지 않습니다.
    void renderAuthState(session);
  });
}

loginTabButton.addEventListener("click", () => selectAccountTab("login"));
signupTabButton.addEventListener("click", () => selectAccountTab("signup"));
loginForm.addEventListener("submit", handleLogin);
signupForm.addEventListener("submit", handleSignup);
logoutButton.addEventListener("click", handleLogout);
teamTasksButton.addEventListener("click", () => selectTaskView("team"));
myTasksButton.addEventListener("click", () => selectTaskView("mine"));
taskDateFilter.addEventListener("change", renderFilteredTasks);
taskStatusFilter.addEventListener("change", renderFilteredTasks);
refreshTasksButton.addEventListener("click", () => void loadTasks());
newTaskButton.addEventListener("click", () => void openTaskEditor());
taskEditorForm.addEventListener("submit", saveTask);
closeTaskEditorButton.addEventListener("click", closeTaskEditor);
cancelTaskEditorButton.addEventListener("click", closeTaskEditor);
taskProgressForm.addEventListener("submit", saveTaskProgress);
closeTaskProgressButton.addEventListener("click", closeTaskProgress);
cancelTaskProgressButton.addEventListener("click", closeTaskProgress);
closeTaskDetailButton.addEventListener("click", closeTaskDetail);
commentForm.addEventListener("submit", saveComment);
cancelCommentEditButton.addEventListener("click", resetCommentForm);
notificationButton.addEventListener("click", openNotificationDialog);
closeNotificationButton.addEventListener("click", () => notificationDialog.close());
markAllNotificationsButton.addEventListener("click", () => void markAllNotificationsRead());

void initializeAuth();
