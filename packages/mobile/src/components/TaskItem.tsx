import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import type { Task } from '../types'

interface TaskItemProps {
	task: Task
	onToggle: (id: number, completed: boolean) => void
	onDelete: (id: number) => void
	loading?: boolean
	deleting?: boolean
}

export const TaskItem = ({ task, onToggle, onDelete, loading, deleting }: TaskItemProps) => (
	<View style={styles.container}>
		<TouchableOpacity onPress={() => onToggle(task.id, !task.completed)} style={styles.checkbox} disabled={loading}>
			{loading ? (
				<ActivityIndicator size="small" color="#007AFF" />
			) : (
				<View style={[styles.checkboxBox, task.completed && styles.checkboxChecked]} />
			)}
		</TouchableOpacity>

		<View style={styles.content}>
			<Text style={[styles.title, task.completed && styles.titleCompleted]}>{task.title}</Text>
			{task.description ? <Text style={styles.description}>{task.description}</Text> : null}
		</View>

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
	},
	content: {
		flex: 1,
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
})
