import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdatePinForm from './Partials/UpdatePinForm';
import GoogleTtsForm from './Partials/GoogleTtsForm';
import BackupForm from './Partials/BackupForm';
import DeleteUserForm from './Partials/DeleteUserForm';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    hasPin: boolean;
    ttsSettings: { hasKey: boolean; voices: Record<string, string> };
    ttsVoices: Record<string, Record<string, string[]>>;
    imagePrompt: string;
}

export default function Edit({ mustVerifyEmail, status, hasPin, ttsSettings, ttsVoices, imagePrompt }: Props) {
    return (
        <AppLayout>
            <Head title="Profil" />

            <div className="space-y-6 max-w-2xl">
                <h1 className="text-2xl font-bold">Profil</h1>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <UpdatePinForm hasPin={hasPin} />
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <UpdatePasswordForm />
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <GoogleTtsForm
                        hasKey={ttsSettings.hasKey}
                        voices={ttsSettings.voices}
                        allVoices={ttsVoices}
                        imagePrompt={imagePrompt}
                    />
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <BackupForm status={status} />
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <DeleteUserForm />
                </div>
            </div>
        </AppLayout>
    );
}
