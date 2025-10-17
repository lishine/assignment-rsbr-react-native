import { useEffect, useState } from 'react'
import {
	View,
	FlatList,
	TouchableOpacity,
	Text,
	StyleSheet,
	ActivityIndicator,
	TextInput,
	Modal,
} from 'react-native'
import type { Task, User } from '../types';
import { ErrorMessage } from '../components/ErrorMessage'
import { TaskItem } from '../components/TaskItem'
import { getTasks, createTask, deleteTask, toggleTaskCompletion } from '../services/api'
import { clearAuth, getUser } from '../utils/storage'

interface TasksScreenProps {
	onLogout?: () => void
}

export const TasksScreen = ({ onLogout }: TasksScreenProps) => {
	const [tasks, setTasks] = useState<Task[]>([])
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [showModal, setShowModal] = useState(false)
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [creatingTask, setCreatingTask] = useState(false)
	const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [taskToDelete, setTaskToDelete] = useState<number | null>(null)
	const [showLogoutModal, setShowLogoutModal] = useState(false)

	useEffect(() => {
		loadTasks()
		loadUser()
	}, [])

	const loadUser = async () => {
		const userData = await getUser()
		setUser(userData)
	};

	const loadTasks = async () => {
		try {
			setLoading(true)
			setError('')
			const response = await getTasks()
			setTasks(response.tasks || [])
		} catch (err: any) {
			setError(err.data?.error || 'Failed to load tasks')
		} finally {
			setLoading(false)
		}
	};

	const handleAddTask = async () => {
		if (!title.trim()) {
			setError('Task title is required')
			return
		}

		try {
			setCreatingTask(true)
			setError('')
			const newTask = await createTask({
				title: title.trim(),
				description: description.trim() || undefined,
			})
			setTasks([newTask.task, ...tasks])
			setTitle('')
			setDescription('')
			setShowModal(false)
		} catch (err: any) {
			setError(err.data?.error || 'Failed to create task')
		} finally {
			setCreatingTask(false)
		}
	};

	const handleDeleteTask = async (id: number) => {
		console.log('handleDeleteTask called with id:', id)
		setTaskToDelete(id)
		setShowDeleteModal(true)
	};

	const confirmDelete = async () => {
		if (taskToDelete === null) {
			return
		}
		
		try {
			console.log('Delete confirmed for task:', taskToDelete)
			setDeletingTaskId(taskToDelete)
			await deleteTask(taskToDelete)
			setTasks(tasks.filter((t) => t.id !== taskToDelete))
		} catch (err: any) {
			console.error('Delete error:', err)
			setError(err.data?.error || err.message || 'Failed to delete task')
		} finally {
			setDeletingTaskId(null)
			setTaskToDelete(null)
			setShowDeleteModal(false)
		}
	};

	const cancelDelete = () => {
		setTaskToDelete(null)
		setShowDeleteModal(false)
	};

	const handleToggleTask = async (id: number, completed: boolean) => {
		try {
			await toggleTaskCompletion(id, completed)
			setTasks(tasks.map((t) => (t.id === id ? { ...t, completed } : t)))
		} catch (err: any) {
			setError(err.data?.error || 'Failed to update task')
		}
	};

	const handleLogout = async () => {
		console.log('handleLogout called')
		setShowLogoutModal(true)
	};

	const confirmLogout = async () => {
		try {
			console.log('Starting logout process...')
			await clearAuth()
			console.log('Auth cleared, calling onLogout callback...')
			onLogout?.()
		} catch (error) {
			console.error('Logout error:', error)
			// Even if there's an error, try to logout anyway
			onLogout?.()
		} finally {
			setShowLogoutModal(false)
		}
	};

	const cancelLogout = () => {
		setShowLogoutModal(false)
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View>
					<Text style={styles.greeting}>Hi, {user?.name}</Text>
					<Text style={styles.taskCount}>{tasks.filter((t) => !t.completed).length} active tasks</Text>
				</View>
				<TouchableOpacity
					onPress={() => {
						console.log('Logout button pressed')
						handleLogout()
					}} 
					style={styles.logoutBtn}
					activeOpacity={0.8}
				>
					<Text style={styles.logoutBtnText}>Logout</Text>
				</TouchableOpacity>
			</View>

			<ErrorMessage message={error} />

			{loading ? (
				<View style={styles.centerContainer}>
					<ActivityIndicator size="large" color="#007AFF" />
				</View>
			) : tasks.length === 0 ? (
				<View style={styles.centerContainer}>
					<Text style={styles.emptyText}>No tasks yet</Text>
					<Text style={styles.emptySubtext}>Create one to get started</Text>
				</View>
			) : (
				<FlatList
					data={tasks}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item }) => (
						<TaskItem 
							task={item} 
							onToggle={handleToggleTask} 
							onDelete={handleDeleteTask}
							deleting={deletingTaskId === item.id}
						/>
					)}
					scrollEnabled
				/>
			)}

			<TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
				<Text style={styles.fabText}>+</Text>
			</TouchableOpacity>

			<Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
				<View style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={() => setShowModal(false)}>
							<Text style={styles.modalCloseBtn}>Cancel</Text>
						</TouchableOpacity>
						<Text style={styles.modalTitle}>New Task</Text>
						<TouchableOpacity onPress={handleAddTask} disabled={creatingTask}>
							<Text style={[styles.modalSaveBtn, creatingTask && styles.modalSaveBtnDisabled]}>
								{creatingTask ? '...' : 'Save'}
							</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.modalForm}>
						<TextInput
							style={styles.modalInput}
							placeholder="Task Title"
							value={title}
							onChangeText={setTitle}
							editable={!creatingTask}
							autoFocus
						/>
						<TextInput
							style={[styles.modalInput, styles.modalTextArea]}
							placeholder="Description (optional)"
							value={description}
							onChangeText={setDescription}
							editable={!creatingTask}
							multiline
						/>
					</View>
				</View>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal visible={showDeleteModal} transparent={true} animationType="fade" onRequestClose={cancelDelete}>
				<View style={styles.modalOverlay}>
					<View style={styles.confirmModal}>
						<Text style={styles.confirmModalTitle}>Delete Task</Text>
						<Text style={styles.confirmModalMessage}>Are you sure you want to delete this task?</Text>
						<View style={styles.confirmModalButtons}>
							<TouchableOpacity style={[styles.confirmModalButton, styles.cancelButton]} onPress={cancelDelete}>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity style={[styles.confirmModalButton, styles.deleteButton]} onPress={confirmDelete}>
								<Text style={styles.deleteButtonText}>Delete</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			{/* Logout Confirmation Modal */}
			<Modal visible={showLogoutModal} transparent={true} animationType="fade" onRequestClose={cancelLogout}>
				<View style={styles.modalOverlay}>
					<View style={styles.confirmModal}>
						<Text style={styles.confirmModalTitle}>Logout</Text>
						<Text style={styles.confirmModalMessage}>Are you sure you want to logout?</Text>
						<View style={styles.confirmModalButtons}>
							<TouchableOpacity style={[styles.confirmModalButton, styles.cancelButton]} onPress={cancelLogout}>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity style={[styles.confirmModalButton, styles.logoutButton]} onPress={confirmLogout}>
								<Text style={styles.logoutButtonText}>Logout</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	)
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
	},
	greeting: {
		fontSize: 20,
		fontWeight: '600',
		color: '#000',
	},
	taskCount: {
		fontSize: 14,
		color: '#666',
		marginTop: 4,
	},
	logoutBtn: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: '#ff3b30',
		borderRadius: 4,
	},
	logoutBtnText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: '600',
	},
	centerContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyText: {
		fontSize: 18,
		fontWeight: '600',
		color: '#000',
	},
	emptySubtext: {
		fontSize: 14,
		color: '#666',
		marginTop: 8,
	},
	fab: {
		position: 'absolute',
		bottom: 24,
		right: 24,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#007AFF',
		justifyContent: 'center',
		alignItems: 'center',
	},
	fabText: {
		fontSize: 32,
		color: '#fff',
		fontWeight: '300',
	},
	modalContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
	},
	modalCloseBtn: {
		color: '#007AFF',
		fontSize: 16,
		fontWeight: '500',
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#000',
	},
	modalSaveBtn: {
		color: '#007AFF',
		fontSize: 16,
		fontWeight: '600',
	},
	modalSaveBtnDisabled: {
		opacity: 0.5,
	},
	modalForm: {
		paddingHorizontal: 16,
		paddingVertical: 24,
	},
	modalInput: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		marginBottom: 16,
		fontSize: 16,
	},
	modalTextArea: {
		height: 100,
		textAlignVertical: 'top',
	},
	// Confirmation Modals
	modalOverlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	confirmModal: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 24,
		marginHorizontal: 32,
		minWidth: 300,
	},
	confirmModalTitle: {
		fontSize: 20,
		fontWeight: '600',
		color: '#000',
		marginBottom: 12,
		textAlign: 'center',
	},
	confirmModalMessage: {
		fontSize: 16,
		color: '#666',
		marginBottom: 24,
		textAlign: 'center',
		lineHeight: 22,
	},
	confirmModalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 12,
	},
	confirmModalButton: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	cancelButton: {
		backgroundColor: '#f0f0f0',
	},
	cancelButtonText: {
		color: '#666',
		fontSize: 16,
		fontWeight: '500',
	},
	deleteButton: {
		backgroundColor: '#ff3b30',
	},
	deleteButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '500',
	},
	logoutButton: {
		backgroundColor: '#ff3b30',
	},
	logoutButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '500',
	},
})
