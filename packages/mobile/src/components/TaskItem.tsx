import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import type { Task } from '../types'

type TaskItemProps = {
	task: Task
	onToggle: (id: number, completed: boolean) => void
	onDelete: (id: number) => void
	onEdit?: (task: Task) => void
	loading?: boolean
	deleting?: boolean
}

export const TaskItem = ({ task, onToggle, onDelete, onEdit, loading, deleting }: TaskItemProps) => (
	<View style={[styles.container, task.completed && styles.containerCompleted]}>
		<TouchableOpacity onPress={() => onToggle(task.id, !task.completed)} style={styles.checkbox} disabled={loading}>
			{loading ? (
				<ActivityIndicator size="small" color="#007AFF" />
			) : (
				<View style={[styles.checkboxBox, task.completed && styles.checkboxChecked]}>
					{task.completed && <Text style={styles.checkmark}>✓</Text>}
				</View>
			)}
		</TouchableOpacity>

		<TouchableOpacity
			style={[styles.content, onEdit && styles.editableContent]}
			onPress={() => onEdit?.(task)}
			disabled={!onEdit}
		>
			<Text style={[styles.title, task.completed && styles.titleCompleted]}>{task.title}</Text>
			{task.description ? (
				<Text style={[styles.description, task.completed && styles.descriptionCompleted]}>
					{task.description}
				</Text>
			) : null}

			<View style={styles.mediaContainer}>
				{task.image && task.image_type && task.drawing ? (
					// Show layered preview when both image and drawing exist
					<View style={styles.layeredThumbnail}>
						<Image
							source={{ uri: `data:${task.image_type};base64,${task.image}` }}
							style={styles.baseThumbnail}
							resizeMode="cover"
						/>
						<Image source={{ uri: task.drawing }} style={styles.drawingThumbOverlay} resizeMode="cover" />
					</View>
				) : (
					<>
						{task.image && task.image_type && (
							<Image
								source={{ uri: `data:${task.image_type};base64,${task.image}` }}
								style={styles.thumbnail}
								resizeMode="cover"
							/>
						)}
						{task.drawing && (
							<Image source={{ uri: task.drawing }} style={styles.thumbnail} resizeMode="cover" />
						)}
					</>
				)}
			</View>
		</TouchableOpacity>

		<TouchableOpacity
			onPress={() => {
				console.log('Delete button pressed for task:', task.id)
				onDelete(task.id)
			}}
			style={styles.deleteBtn}
			disabled={loading || deleting}
			activeOpacity={0.8}
		>
			{deleting ? (
				<ActivityIndicator size="small" color="#fff" />
			) : (
				<Text style={styles.deleteBtnText}>Delete</Text>
			)}
		</TouchableOpacity>
	</View>
)

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
	},
	containerCompleted: {
		opacity: 0.6,
		backgroundColor: '#f9f9f9',
	},
	checkbox: {
		marginRight: 12,
		padding: 8,
	},
	checkboxBox: {
		width: 24,
		height: 24,
		borderWidth: 2,
		borderColor: '#007AFF',
		borderRadius: 4,
	},
	checkboxChecked: {
		backgroundColor: '#007AFF',
		borderColor: '#007AFF',
	},
	checkmark: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
		textAlign: 'center',
		lineHeight: 20,
	},
	content: {
		flex: 1,
	},
	editableContent: {
		opacity: 0.8,
	},
	title: {
		fontSize: 16,
		fontWeight: '500',
		color: '#000',
	},
	titleCompleted: {
		color: '#999',
		textDecorationLine: 'line-through',
	},
	descriptionCompleted: {
		color: '#aaa',
	},
	description: {
		fontSize: 14,
		color: '#666',
		marginTop: 4,
	},
	deleteBtn: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: '#ff3b30',
		borderRadius: 4,
	},
	deleteBtnText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: '600',
	},
	mediaContainer: {
		flexDirection: 'row',
		marginTop: 8,
		gap: 8,
	},
	thumbnail: {
		width: 60,
		height: 60,
		borderRadius: 4,
	},
	layeredThumbnail: {
		width: 60,
		height: 60,
		borderRadius: 4,
		position: 'relative',
	},
	baseThumbnail: {
		width: '100%',
		height: '100%',
		borderRadius: 4,
	},
	drawingThumbOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		borderRadius: 4,
	},
})
