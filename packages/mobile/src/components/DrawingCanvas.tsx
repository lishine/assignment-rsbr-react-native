import React, { useRef } from 'react'
import { View, StyleSheet, Modal, TouchableOpacity, Text } from 'react-native'
import SignatureCanvas from 'react-native-signature-canvas'

type DrawingCanvasProps = {
	visible: boolean
	onClose: () => void
	onSave: (base64: string) => void
	backgroundImage?: string
	backgroundImageType?: string
}

export default function DrawingCanvas({
	visible,
	onClose,
	onSave,
	backgroundImage,
	backgroundImageType,
}: DrawingCanvasProps) {
	const signatureRef = useRef<any>(null)

	const handleSave = (signature?: string) => {
		if (signature) {
			onSave(signature)
			onClose()
		}
	}

	const handleClear = () => {
		signatureRef.current?.clearSignature()
	}

	// Use background image with CSS for drawing over image
	const webStyle =
		backgroundImage && backgroundImageType
			? `
		body, html {
			margin: 0;
			padding: 0;
			width: 100%;
			height: 100%;
			overflow: hidden;
		}
		.m-signature-pad {
			box-shadow: none;
			border: 3px dashed #007AFF;
			margin: 8px;
			border-radius: 8px;
			width: calc(100% - 16px);
			height: calc(100% - 16px);
			box-sizing: border-box;
		}
		.m-signature-pad--body {
			border: none;
			background-color: white;
			background-image: url('data:${backgroundImageType};base64,${backgroundImage}');
			background-size: contain;
			background-position: center;
			background-repeat: no-repeat;
			position: relative;
		}
		.m-signature-pad--body canvas {
			background-color: transparent !important;
			position: relative;
			z-index: 2;
		}
		.m-signature-pad--footer {
			display: none;
		}
	`
			: `
		body, html {
			margin: 0;
			padding: 0;
			width: 100%;
			height: 100%;
			overflow: hidden;
		}
		.m-signature-pad {
			box-shadow: none;
			border: 3px dashed #007AFF;
			margin: 8px;
			border-radius: 8px;
			width: calc(100% - 16px);
			height: calc(100% - 16px);
			box-sizing: border-box;
		}
		.m-signature-pad--body {
			border: none;
			background-color: transparent;
		}
		.m-signature-pad--body canvas {
			background-color: transparent !important;
		}
		.m-signature-pad--footer {
			display: none;
		}
	`

	return (
		<Modal visible={visible} animationType="slide" onRequestClose={onClose}>
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity onPress={handleClear} style={styles.headerButton}>
						<Text style={styles.headerButtonText}>Clear</Text>
					</TouchableOpacity>
					<Text style={styles.title}>Draw Here</Text>
					<TouchableOpacity onPress={onClose} style={styles.headerButton}>
						<Text style={styles.headerButtonText}>Cancel</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.canvasContainer}>
					<SignatureCanvas
						ref={signatureRef}
						onOK={handleSave}
						descriptionText=""
						webStyle={webStyle}
						backgroundColor="transparent"
						penColor="black"
					/>
				</View>

				<View style={styles.footer}>
					<TouchableOpacity style={styles.saveButton} onPress={() => signatureRef.current?.readSignature()}>
						<Text style={styles.saveButtonText}>Save Drawing</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
		paddingTop: 50,
	},
	headerButton: {
		padding: 10,
	},
	headerButtonText: {
		color: '#007AFF',
		fontSize: 16,
	},
	title: {
		fontSize: 18,
		fontWeight: '600',
	},
	canvasContainer: {
		flex: 1,
		backgroundColor: 'white',
		overflow: 'hidden',
	},
	footer: {
		padding: 15,
		borderTopWidth: 1,
		borderTopColor: '#e0e0e0',
	},
	saveButton: {
		backgroundColor: '#34C759',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
	},
	saveButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
})
