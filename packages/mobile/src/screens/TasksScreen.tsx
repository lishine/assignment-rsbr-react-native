import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { getTasks, createTask, deleteTask, toggleTaskCompletion } from '../services/api.js';
import { clearAuth, getUser } from '../utils/storage.js';
import { TaskItem } from '../components/TaskItem.js';
import { ErrorMessage } from '../components/ErrorMessage.js';
import { Task, TaskRequest, User } from '../types.js';

interface TasksScreenProps {
  onLogout?: () => void;
}

export function TasksScreen({ onLogout }: TasksScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    loadTasks();
    loadUser();
  }, []);

  async function loadUser() {
    const userData = await getUser();
    setUser(userData);
  }

  async function loadTasks() {
    try {
      setLoading(true);
      setError('');
      const response = await getTasks();
      setTasks(response.tasks || []);
    } catch (err: any) {
      setError(err.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTask() {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setCreatingTask(true);
      setError('');
      const newTask = await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setTasks([newTask.task, ...tasks]);
      setTitle('');
      setDescription('');
      setShowModal(false);
    } catch (err: any) {
      setError(err.data?.error || 'Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  }

  async function handleDeleteTask(id: number) {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteTask(id);
            setTasks(tasks.filter((t) => t.id !== id));
          } catch (err: any) {
            setError(err.data?.error || 'Failed to delete task');
          }
        },
      },
    ]);
  }

  async function handleToggleTask(id: number, completed: boolean) {
    try {
      await toggleTaskCompletion(id, completed);
      setTasks(
        tasks.map((t) =>
          t.id === id ? { ...t, completed } : t
        )
      );
    } catch (err: any) {
      setError(err.data?.error || 'Failed to update task');
    }
  }

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await clearAuth();
          onLogout?.();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.name}</Text>
          <Text style={styles.taskCount}>
            {tasks.filter((t) => !t.completed).length} active tasks
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
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
            />
          )}
          scrollEnabled
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCloseBtn}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Task</Text>
            <TouchableOpacity
              onPress={handleAddTask}
              disabled={creatingTask}
            >
              <Text
                style={[
                  styles.modalSaveBtn,
                  creatingTask && styles.modalSaveBtnDisabled,
                ]}
              >
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
    </View>
  );
}

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
});
