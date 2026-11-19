import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Text, TextInput } from '@/components/responsive-text';
import { WorkspacePage, Select, ui } from '@/components/workspace-ui';
import { admitStudent, type Admission } from '@/components/school/admission-store';

const empty: Admission = {
  name: '',
  grade: '',
  section: '',
  birthDate: '',
  gender: '',
  emergencyPhone: '',
  bloodGroup: '',
  guardian: '',
  email: '',
  phone: '',
  address: ''
};

const classes = ['Play Group', 'Nursery', 'KG I', 'KG II', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
const sections = ['Section A (Boys)', 'Section B (Girls)'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['Male', 'Female', 'Other'];

export default function AdmissionPage() {
  const [draft, setDraft] = useState<Admission>(empty);
  const [error, setError] = useState('');

  return (
    <WorkspacePage title="Student Admission">
      <Text style={ui.note}>Admit a student for School and Gym facilities. Student ID is auto-generated upon admission.</Text>
      <View style={ui.card}>
        <View style={{ gap: 8 }}>
          <Text>Full Name</Text>
          <TextInput
            accessibilityLabel="Full Name"
            style={ui.input}
            value={draft.name}
            onChangeText={value => setDraft({ ...draft, name: value })}
            placeholder="Full Name"
            autoCapitalize="words"
          />
        </View>
        <Select
          label="Class"
          value={draft.grade}
          options={classes.map(value => ({ value, label: value }))}
          onChange={grade => setDraft({ ...draft, grade })}
        />
        <Select
          label="Section"
          value={draft.section || ''}
          options={sections.map(value => ({ value, label: value }))}
          onChange={section => setDraft({ ...draft, section })}
        />
        <View style={{ gap: 8 }}>
          <Text>Date of Birth</Text>
          <TextInput
            accessibilityLabel="Date of Birth"
            style={ui.input}
            value={draft.birthDate}
            onChangeText={value => setDraft({ ...draft, birthDate: value })}
            placeholder="YYYY-MM-DD"
          />
        </View>
        <Select
          label="Gender"
          value={draft.gender}
          options={genders.map(value => ({ value, label: value }))}
          onChange={gender => setDraft({ ...draft, gender })}
        />
        <Select
          label="Blood Group"
          value={draft.bloodGroup}
          options={bloodGroups.map(value => ({ value, label: value }))}
          onChange={bloodGroup => setDraft({ ...draft, bloodGroup })}
        />
        <View style={{ gap: 8 }}>
          <Text>Parent / Guardian</Text>
          <TextInput
            accessibilityLabel="Parent / Guardian"
            style={ui.input}
            value={draft.guardian}
            onChangeText={value => setDraft({ ...draft, guardian: value })}
            placeholder="Parent or Guardian Name"
            autoCapitalize="words"
          />
        </View>
        <View style={{ gap: 8 }}>
          <Text>Guardian Phone</Text>
          <TextInput
            accessibilityLabel="Guardian Phone"
            style={ui.input}
            value={draft.phone}
            onChangeText={value => setDraft({ ...draft, phone: value })}
            placeholder="Guardian Phone"
            keyboardType="phone-pad"
          />
        </View>
        <View style={{ gap: 8 }}>
          <Text>Emergency Number</Text>
          <TextInput
            accessibilityLabel="Emergency Number"
            style={ui.input}
            value={draft.emergencyPhone}
            onChangeText={value => setDraft({ ...draft, emergencyPhone: value })}
            placeholder="Emergency Contact Number"
            keyboardType="phone-pad"
          />
        </View>
        <View style={{ gap: 8 }}>
          <Text>Guardian Email</Text>
          <TextInput
            accessibilityLabel="Guardian Email"
            style={ui.input}
            value={draft.email}
            onChangeText={value => setDraft({ ...draft, email: value })}
            placeholder="guardian@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={{ gap: 8 }}>
          <Text>Address</Text>
          <TextInput
            accessibilityLabel="Address"
            style={ui.input}
            value={draft.address}
            onChangeText={value => setDraft({ ...draft, address: value })}
            placeholder="Residential Address"
            autoCapitalize="words"
          />
        </View>
      </View>
      {!!error && <Text accessibilityRole="alert" style={{ color: '#ba3442' }}>{error}</Text>}
      <Pressable
        style={ui.button}
        onPress={() => {
          const issue = admitStudent(draft);
          if (issue) setError(issue);
          else router.replace({ pathname: '/student/[id]', params: { id: (draft.id || '').trim() } });
        }}
      >
        <Text style={ui.white}>Admit Student</Text>
      </Pressable>
    </WorkspacePage>
  );
}
