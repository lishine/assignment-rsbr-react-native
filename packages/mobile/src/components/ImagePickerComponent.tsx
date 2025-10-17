import React, { useState } from 'react'
import { View, TouchableOpacity, Text, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'

type ImagePickerComponentProps = {
	onImageSelected: (base64: string, mimeType: string) => void
	currentImage?: string
	currentImageType?: string
}

export default function ImagePickerComponent({ onImageSelected, currentImage, currentImageType }: ImagePickerComponentProps) {
	const [previewUri, setPreviewUri] = useState<string | undefined>(
		currentImage && currentImageType ? `data:${currentImageType};base64,${currentImage}` : undefined
	)
	const [compressing, setCompressing] = useState(false)

	const pickImage = async () => {
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

		if (permissionResult.granted === false) {
			Alert.alert('Permission Required', 'You need to allow access to your photo library.')
			return
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			quality: 1,
			base64: false,
		})

		if (result.canceled || !result.assets?.[0]) {
			return
		}

		setCompressing(true)

		try {
			const asset = result.assets[0]
			let imageUri = asset.uri
			let quality = 100
			let base64: string | undefined
			let compressed = false

			while (quality > 10) {
				const actions = quality < 100 ? [{ resize: { width: 800 } }] : []
				
				const manipulatedImage = await ImageManipulator.manipulateAsync(
					imageUri,
					actions,
					{
						compress: quality / 100,
						format: ImageManipulator.SaveFormat.JPEG,
						base64: true,
					}
				)

				base64 = manipulatedImage.base64
				if (!base64) break

				const sizeInBytes = base64.length * 0.75

				if (sizeInBytes <= 200000) {
					break
				}

				compressed = true
				imageUri = manipulatedImage.uri
				quality -= 10
			}

			if (!base64) {
				Alert.alert('Error', 'Failed to process image.')
				return
			}

			const finalSize = base64.length * 0.75

			if (finalSize > 200000) {
				Alert.alert(
					'Image Too Large',
					'Unable to compress image below 200KB. Please select a smaller image or crop it more.'
				)
				return
			}

			const mimeType = 'image/jpeg'

			setPreviewUri(`data:${mimeType};base64,${base64}`)
			onImageSelected(base64, mimeType)
		} catch (error) {
			console.error('Image processing error:', error)
			Alert.alert('Error', 'Failed to process image.')
		} finally {
			setCompressing(false)
		}
	}

	const removeImage = () => {
		setPreviewUri(undefined)
		onImageSelected('', '')
	}

	return (
		<View style={styles.container}>
			{compressing && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#007AFF" />
					<Text style={styles.loadingText}>Compressing image...</Text>
				</View>
			)}
			{previewUri ? (
				<View>
					<Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
					<View style={styles.buttonRow}>
						<TouchableOpacity style={styles.changeButton} onPress={pickImage} disabled={compressing}>
							<Text style={styles.buttonText}>Change</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.removeButton} onPress={removeImage} disabled={compressing}>
							<Text style={styles.buttonText}>Remove</Text>
						</TouchableOpacity>
					</View>
				</View>
			) : (
				<TouchableOpacity style={styles.pickButton} onPress={pickImage} disabled={compressing}>
					{compressing ? (
						<ActivityIndicator size="small" color="white" />
					) : (
						<Text style={styles.pickButtonText}>+ Add Image</Text>
					)}
				</TouchableOpacity>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginVertical: 10,
	},
	pickButton: {
		backgroundColor: '#007AFF',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
	},
	pickButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
	preview: {
		width: '100%',
		height: 200,
		borderRadius: 8,
		marginBottom: 10,
	},
	buttonRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
	},
	changeButton: {
		flex: 1,
		backgroundColor: '#007AFF',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	removeButton: {
		flex: 1,
		backgroundColor: '#FF3B30',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	buttonText: {
		color: 'white',
		fontSize: 14,
		fontWeight: '600',
	},
	loadingOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 10,
		borderRadius: 8,
	},
	loadingText: {
		marginTop: 10,
		fontSize: 14,
		color: '#666',
	},
})
