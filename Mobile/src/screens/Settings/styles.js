import {
  StyleSheet,
} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 60,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 9,
    marginLeft: 2,
  },

  photoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },

  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#1B1B1B',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },

  avatar: {
    width: '100%',
    height: '100%',
  },

  defaultAvatar: {
    width: 140,
    height: 140,
    transform: [
      {
        scale: 4.2,
      },
    ],
  },

  changePhotoButton: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
    minWidth: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },

  changePhotoText: {
    color: '#141414',
    fontSize: 14,
    fontWeight: '800',
  },

  cancelPhotoButton: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: -7,
    marginBottom: 16,
    marginRight: 3,
  },

  divider: {
    width: '100%',
    height: 1,
    marginTop: 22,
    marginBottom: 26,
  },

  helperText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 17,
  },

  passwordSection: {
    marginTop: 8,
  },
});