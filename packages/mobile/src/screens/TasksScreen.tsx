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
	ScrollView,
	Image,
} from 'react-native'
import type { Task, User } from '../types'
import DrawingCanvas from '../components/DrawingCanvas'
import { ErrorMessage } from '../components/ErrorMessage'
import ImagePickerComponent from '../components/ImagePickerComponent'
import { TaskItem } from '../components/TaskItem'
import { getTasks, createTask, updateTask, deleteTask, toggleTaskCompletion } from '../services/api'
import { clearAuth, getUser } from '../utils/storage'

type TasksScreenProps = {
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
	const [image, setImage] = useState('')
	const [drawing, setDrawing] = useState('')
	const [imageType, setImageType] = useState('')
	const [showDrawingCanvas, setShowDrawingCanvas] = useState(false)
	const [editingTask, setEditingTask] = useState<Task | null>(null)
	const [drawingHasImage, setDrawingHasImage] = useState(false) // Track if drawing was created from image

	useEffect(() => {
		loadTasks()
		loadUser()
	}, [])

	const loadUser = async () => {
		const userData = await getUser()
		setUser(userData)
	}

	const clearFormData = () => {
		setTitle('')
		setDescription('')
		setImage('')
		setDrawing('')
		setImageType('')
		setDrawingHasImage(false)
		setError('')
	}

	const closeModal = () => {
		clearFormData()
		setEditingTask(null)
		setShowModal(false)
	}

	const openEditModal = (task: Task) => {
		setEditingTask(task)
		setTitle(task.title)
		setDescription(task.description || '')
		// Show both image and drawing when editing (they will be displayed as layered)
		setImage(task.image || '')
		setImageType(task.image_type || '')
		setDrawing(task.drawing || '')
		setDrawingHasImage(!!(task.image && task.drawing))
		setShowModal(true)
	}

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
	}

	const handleSaveTask = async () => {
		if (!title.trim()) {
			setError('Task title is required')
			return
		}

		try {
			setCreatingTask(true)
			setError('')

			// Always send both image and drawing when they exist
			// We'll display them as layered/combined in the UI
			const taskData = {
				title: title.trim(),
				description: description.trim() || undefined,
				image: image || undefined,
				drawing: drawing || undefined,
				image_type: imageType || undefined,
			}

			if (editingTask) {
				// Update existing task
				const updatedTask = await updateTask(editingTask.id, taskData)
				setTasks(tasks.map((t) => (t.id === editingTask.id ? updatedTask.task : t)))
			} else {
				// Create new task
				const newTask = await createTask(taskData)
				setTasks([newTask.task, ...tasks])
			}

			closeModal()
		} catch (err: any) {
			setError(err.data?.error || `Failed to ${editingTask ? 'update' : 'create'} task`)
		} finally {
			setCreatingTask(false)
		}
	}

	const handleDeleteTask = async (id: number) => {
		console.log('handleDeleteTask called with id:', id)
		setTaskToDelete(id)
		setShowDeleteModal(true)
	}

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
	}

	const cancelDelete = () => {
		setTaskToDelete(null)
		setShowDeleteModal(false)
	}

	const handleToggleTask = async (id: number, completed: boolean) => {
		try {
			await toggleTaskCompletion(id, completed)
			setTasks(tasks.map((t) => (t.id === id ? { ...t, completed } : t)))
		} catch (err: any) {
			setError(err.data?.error || 'Failed to update task')
		}
	}

	const confirmLogout = async () => {
		try {
			console.log('Starting logout process...')
			await clearAuth()
			console.log('Auth cleared, calling onLogout callback...')
		} catch (error) {
			console.error('Logout error:', error)
		} finally {
			// Even if there's an error, try to logout anyway
			onLogout?.()
			setShowLogoutModal(false)
		}
	}

	const cancelLogout = () => {
		setShowLogoutModal(false)
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.headerContent}>
					<View style={styles.headerRow}>
						<Text style={styles.greeting}>Hi, {user?.name}</Text>
					</View>
					<View style={styles.headerRow}>
						<Text style={styles.taskCount}>{tasks.filter((t) => !t.completed).length} active tasks</Text>
					</View>
				</View>
			</View>

			<ErrorMessage message={error} />

			<View style={styles.contentContainer}>
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
								onEdit={openEditModal}
								deleting={deletingTaskId === item.id}
							/>
						)}
						style={{ flex: 1 }}
					/>
				)}
			</View>

			<TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
				<Text style={styles.fabText}>+</Text>
			</TouchableOpacity>

			<Modal visible={showModal} animationType="slide" onRequestClose={closeModal}>
				<View style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={closeModal}>
							<Text style={[styles.modalBtnText, styles.cancelBtnText]}>Cancel</Text>
						</TouchableOpacity>
						<Text style={styles.modalTitle}>{editingTask ? 'Edit Task' : 'New Task'}</Text>
						<TouchableOpacity
							style={[styles.modalBtn, styles.saveBtn, !title.trim() && styles.btnDisabled]}
							onPress={handleSaveTask}
							disabled={creatingTask || !title.trim()}
						>
							<Text style={[styles.modalBtnText, !title.trim() && styles.btnDisabledText]}>
								{creatingTask ? '...' : 'Save'}
							</Text>
						</TouchableOpacity>
					</View>

					<ScrollView style={styles.modalForm}>
						<TextInput
							style={styles.modalInput}
							placeholder="Task Title"
							value={title}
							onChangeText={setTitle}
							editable={!creatingTask}
							autoFocus={!editingTask}
						/>
						<TextInput
							style={[styles.modalInput, styles.modalTextArea]}
							placeholder="Description (optional)"
							value={description}
							onChangeText={setDescription}
							editable={!creatingTask}
							multiline
						/>

						{!(image && drawing) && (
							<>
								<ImagePickerComponent
									onImageSelected={(base64, mimeType) => {
										setImage(base64)
										setImageType(mimeType)
									}}
									currentImage={image}
									currentImageType={imageType}
								/>

								<TouchableOpacity
									style={styles.drawingButton}
									onPress={() => setShowDrawingCanvas(true)}
									disabled={creatingTask}
								>
									<Text style={styles.drawingButtonText}>
										{drawing
											? drawingHasImage
												? '✓ Drawing on Image'
												: '✓ Drawing Added'
											: image
												? '+ Draw on Image'
												: '+ Add Drawing'}
									</Text>
								</TouchableOpacity>
							</>
						)}

						{/* Show combined preview when we have both image and drawing */}
						{image && drawing ? (
							<View style={styles.combinedPreviewContainer}>
								<Text style={styles.combinedPreviewLabel}>Drawing on Image Preview:</Text>
								<View style={styles.layeredPreview}>
									<Image
										source={{ uri: `data:${imageType};base64,${image}` }}
										style={styles.baseImagePreview}
										resizeMode="contain"
									/>
									<Image
										source={{ uri: drawing }}
										style={styles.drawingOverlay}
										resizeMode="contain"
									/>
								</View>
								<TouchableOpacity
									style={styles.removeDrawingButton}
									onPress={() => {
										setDrawing('')
										setDrawingHasImage(false)
									}}
									disabled={creatingTask}
								>
									<Text style={styles.removeDrawingButtonText}>Remove Drawing</Text>
								</TouchableOpacity>
							</View>
						) : drawing ? (
							<View style={styles.drawingPreviewContainer}>
								<Text style={styles.drawingPreviewLabel}>
									{drawingHasImage ? 'Drawing on Image Preview:' : 'Drawing Preview:'}
								</Text>
								<Image source={{ uri: drawing }} style={styles.drawingPreview} resizeMode="contain" />
								<TouchableOpacity
									style={styles.removeDrawingButton}
									onPress={() => {
										setDrawing('')
										setDrawingHasImage(false)
									}}
									disabled={creatingTask}
								>
									<Text style={styles.removeDrawingButtonText}>Remove Drawing</Text>
								</TouchableOpacity>
							</View>
						) : null}
					</ScrollView>
				</View>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal visible={showDeleteModal} transparent={true} animationType="fade" onRequestClose={cancelDelete}>
				<View style={styles.modalOverlay}>
					<View style={styles.confirmModal}>
						<Text style={styles.confirmModalTitle}>Delete Task</Text>
						<Text style={styles.confirmModalMessage}>Are you sure you want to delete this task?</Text>
						<View style={styles.confirmModalButtons}>
							<TouchableOpacity
								style={[styles.confirmModalButton, styles.cancelButton]}
								onPress={cancelDelete}
							>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.confirmModalButton, styles.deleteButton]}
								onPress={confirmDelete}
							>
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
							<TouchableOpacity
								style={[styles.confirmModalButton, styles.cancelButton]}
								onPress={cancelLogout}
							>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.confirmModalButton, styles.logoutButton]}
								onPress={confirmLogout}
							>
								<Text style={styles.logoutButtonText}>Logout</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			{/* Drawing Canvas Modal */}
			<DrawingCanvas
				visible={showDrawingCanvas}
				onClose={() => setShowDrawingCanvas(false)}
				onSave={(base64) => {
					setDrawing(base64)
					// If we drew on an image, mark it but keep the image for layered preview
					if (image) {
						setDrawingHasImage(true)
						// Don't clear image - keep it for layered preview
					} else {
						setDrawingHasImage(false)
					}
				}}
				backgroundImage={image}
				backgroundImageType={imageType}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	contentContainer: {
		flex: 1,
		backgroundColor: '#ffffff',
		borderTopColor: '#ffffff',
		marginTop: -1, // Overlap the border to create separation
	},

	header: {
		backgroundColor: '#f8f9fa',
		borderBottomWidth: 2,
		borderBottomColor: '#dee2e6',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	headerContent: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 11,
	},
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	greeting: {
		fontSize: 20,
		fontWeight: '700',
		color: '#1a1a1a',
		marginBottom: 2,
	},
	taskCount: {
		fontSize: 16,
		color: '#6c757d',
		fontWeight: '500',
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
	modalTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#000',
	},
	modalBtn: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: '#007AFF',
		minWidth: 60,
		alignItems: 'center',
	},
	cancelBtn: {
		borderColor: '#666',
	},
	saveBtn: {
		borderColor: '#007AFF',
	},
	btnDisabled: {
		borderColor: '#ccc',
	},
	modalBtnText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#007AFF',
	},
	cancelBtnText: {
		color: '#666',
	},
	btnDisabledText: {
		color: '#ccc',
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
		fontWeight: '500',
	},
	drawingButton: {
		backgroundColor: '#34C759',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 10,
	},
	drawingButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
	drawingPreviewContainer: {
		marginTop: 15,
		padding: 10,
		backgroundColor: '#f9f9f9',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#e0e0e0',
	},
	drawingPreviewLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333',
		marginBottom: 10,
	},
	drawingPreview: {
		width: '100%',
		height: 200,
		backgroundColor: 'white',
		borderRadius: 4,
		marginBottom: 10,
	},
	removeDrawingButton: {
		backgroundColor: '#FF3B30',
		padding: 10,
		borderRadius: 6,
		alignItems: 'center',
	},
	removeDrawingButtonText: {
		color: 'white',
		fontSize: 14,
		fontWeight: '600',
	},
	combinedPreviewContainer: {
		marginTop: 15,
		padding: 10,
		backgroundColor: '#f9f9f9',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#e0e0e0',
	},
	combinedPreviewLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333',
		marginBottom: 10,
	},
	layeredPreview: {
		width: '100%',
		height: 200,
		backgroundColor: 'white',
		borderRadius: 4,
		marginBottom: 10,
		position: 'relative',
	},
	baseImagePreview: {
		width: '100%',
		height: '100%',
		borderRadius: 4,
	},
	drawingOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		borderRadius: 4,
	},
})
