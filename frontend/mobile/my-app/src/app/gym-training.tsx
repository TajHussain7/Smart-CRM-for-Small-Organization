import GymFeatureGate from '@/components/gym-feature-gate';
import TrainingSessionsScreen from '@/components/gym/training-sessions-screen';
export default function GymTrainingRoute() { return <GymFeatureGate feature="training"><TrainingSessionsScreen /></GymFeatureGate>; }
