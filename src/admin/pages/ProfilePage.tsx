import { useState } from "react";
import { User, Mail, Phone, MapPin, Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "IGBC Admin",
    email: "admin@igbc.in",
    phone: "+91 98765 43210",
    role: "Super Admin",
    location: "Hyderabad, India",
    bio: "Managing IGBC operations and green building certifications.",
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Avatar Card */}
      <div className="kpi-card flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{profile.name}</h2>
          <p className="text-xs text-muted-foreground">{profile.role}</p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {profile.location}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="kpi-card space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Full Name", value: profile.name, key: "name", icon: User },
            { label: "Email", value: profile.email, key: "email", icon: Mail },
            { label: "Phone", value: profile.phone, key: "phone", icon: Phone },
            { label: "Location", value: profile.location, key: "location", icon: MapPin },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{field.label}</label>
              <div className="relative mt-1">
                <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                  className="filter-input w-full pl-9 pr-3 py-2 text-[13px]"
                />
              </div>
            </div>
          ))}
        </div>
        <div>
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={3}
            className="filter-input w-full mt-1 text-[13px] resize-none"
          />
        </div>
        <div className="flex justify-end">
          <Button size="sm" className="gap-1.5 text-xs">
            <Save className="w-3.5 h-3.5" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
