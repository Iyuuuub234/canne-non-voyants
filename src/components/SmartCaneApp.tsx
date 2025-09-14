import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Navigation,
  Bluetooth,
  AlertTriangle,
  Phone,
  MapPin,
  Volume2,
  History,
  Settings,
  CheckCircle,
  Waves,
  Languages,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVoiceNotifications } from "@/hooks/useVoiceNotifications";
import dynamic from 'next/dynamic';

// Import dynamique pour éviter les problèmes de rendu côté serveur
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="h-64 w-full flex items-center justify-center bg-gray-100 rounded-lg">Chargement de la carte...</div>
});

interface ObstacleEvent {
  id: string;
  type: 'front' | 'ground';
  timestamp: Date;
  location?: { lat: number; lng: number };
  description: string;
}

type Language = 'fr' | 'ar' | 'en';

interface Translations {
  appTitle: string;
  appSubtitle: string;
  connected: string;
  disconnected: string;
  connect: string;
  disconnect: string;
  battery: string;
  emergencySOS: string;
  longPressAlert: string;
  realtimeDetection: string;
  noObstacle: string;
  frontObstacle: string;
  groundObstacle: string;
  quickActions: string;
  history: string;
  locate: string;
  audioTest: string;
  settings: string;
  language: string;
  obstacleAlert: string;
  sosAlert: string;
  sosDescription: string;
  caneDisconnected: string;
  caneConnected: string;
  historyFunction: string;
  locationFunction: string;
  audioTestSuccess: string;
  accessibilitySettings: string;
  emergencyCall: string;
  mapTitle: string;
  loadingMap: string;
}

const translations: Record<Language, Translations> = {
  fr: {
    appTitle: "CaneConnect",
    appSubtitle: "Canne Intelligente",
    connected: "Connectée",
    disconnected: "Déconnectée",
    connect: "Se connecter",
    disconnect: "Déconnecter",
    battery: "Batterie",
    emergencySOS: "URGENCE SOS",
    longPressAlert: "Appui long pour alerter votre contact",
    realtimeDetection: "Détection en Temps Réel",
    noObstacle: "Aucun obstacle détecté",
    frontObstacle: "Obstacle devant détecté",
    groundObstacle: "Dénivellation détectée",
    quickActions: "Actions Rapides",
    history: "Historique",
    locate: "Localiser",
    audioTest: "Test Audio",
    settings: "Paramètres",
    language: "Langue",
    obstacleAlert: "⚠️ Alerte Obstacle",
    sosAlert: "🚨 SOS Envoyé",
    sosDescription: "Votre contact d'urgence a été prévenu avec votre position",
    caneDisconnected: "Canne déconnectée",
    caneConnected: "Canne connectée avec succès",
    historyFunction: "Fonction historique",
    locationFunction: "Fonction localisation",
    audioTestSuccess: "Test audio réussi",
    accessibilitySettings: "Paramètres d'accessibilité",
    emergencyCall: "Appel d'urgence envoyé à votre contact",
    mapTitle: "Carte d'Agadir",
    loadingMap: "Chargement de la carte..."
  },
  ar: {
    appTitle: "كين كونكت",
    appSubtitle: "العصا الذكية",
    connected: "متصل",
    disconnected: "غير متصل",
    connect: "اتصال",
    disconnect: "قطع الاتصال",
    battery: "البطارية",
    emergencySOS: "طوارئ SOS",
    longPressAlert: "اضغط مطولاً لتنبيه جهة الاتصال",
    realtimeDetection: "كشف فوري",
    noObstacle: "لا توجد عوائق",
    frontObstacle: "عائق أمامي مكتشف",
    groundObstacle: "منحدر مكتشف",
    quickActions: "إجراءات سريعة",
    history: "التاريخ",
    locate: "تحديد الموقع",
    audioTest: "اختبار الصوت",
    settings: "الإعدادات",
    language: "اللغة",
    obstacleAlert: "⚠️ تنبيه عائق",
    sosAlert: "🚨 تم إرسal SOS",
    sosDescription: "تم إبلاغ جهة الاتصال الطارئة بموقعك",
    caneDisconnected: "تم قطع اتصال العصا",
    caneConnected: "تم توصيل العصا بنجاح",
    historyFunction: "وظيفة التاريخ",
    locationFunction: "وظيفة الموقع",
    audioTestSuccess: "نجح اختبار الصوت",
    accessibilitySettings: "إعدادات إمكانية الوصول",
    emergencyCall: "تم إرسال مكالمة طوارئ إلى جهة الاتصال",
    mapTitle: "خريطة أكادير",
    loadingMap: "جاري تحميل الخريطة..."
  },
  en: {
    appTitle: "CaneConnect",
    appSubtitle: "Smart Cane",
    connected: "Connected",
    disconnected: "Disconnected",
    connect: "Connect",
    disconnect: "Disconnect",
    battery: "Battery",
    emergencySOS: "EMERGENCY SOS",
    longPressAlert: "Long press to alert your contact",
    realtimeDetection: "Real-time Detection",
    noObstacle: "No obstacles detected",
    frontObstacle: "Front obstacle detected",
    groundObstacle: "Ground level change detected",
    quickActions: "Quick Actions",
    history: "History",
    locate: "Locate",
    audioTest: "Audio Test",
    settings: "Settings",
    language: "Language",
    obstacleAlert: "⚠️ Obstacle Alert",
    sosAlert: "🚨 SOS Sent",
    sosDescription: "Your emergency contact has been notified with your location",
    caneDisconnected: "Cane disconnected",
    caneConnected: "Cane connected successfully",
    historyFunction: "History function",
    locationFunction: "Location function",
    audioTestSuccess: "Audio test successful",
    accessibilitySettings: "Accessibility settings",
    emergencyCall: "Emergency call sent to your contact",
    mapTitle: "Agadir Map",
    loadingMap: "Loading map..."
  }
};

const SmartCaneApp = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [recentEvents, setRecentEvents] = useState<ObstacleEvent[]>([]);
  const [isVibrating, setIsVibrating] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('fr');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { toast } = useToast();

  // Utilisation du hook de notifications vocales
  const { speak, speakImmediate, hasArabicSupport } = useVoiceNotifications({
    language: currentLanguage,
    enabled: true,
    config: {
      rate: 0.8,
      volume: 0.9,
      pitch: 1.0
    }
  });

  const t = translations[currentLanguage];
  const isRTL = currentLanguage === 'ar';

  // Simulate obstacle detection
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected && Math.random() > 0.85) {
        const eventType = Math.random() > 0.5 ? 'front' : 'ground';
        const newEvent: ObstacleEvent = {
          id: Date.now().toString(),
          type: eventType,
          timestamp: new Date(),
          description: eventType === 'front' ? t.frontObstacle : t.groundObstacle
        };

        setRecentEvents(prev => [newEvent, ...prev.slice(0, 4)]);
        setIsVibrating(true);
        
        // Utilisation de speakImmediate pour les alertes prioritaires
        speakImmediate(newEvent.description);

        setTimeout(() => setIsVibrating(false), 800);

        toast({
          title: t.obstacleAlert,
          description: newEvent.description,
          variant: "destructive"
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isConnected, toast, t, speakImmediate]);

  const handleSOSCall = () => {
    // Utilisation de speakImmediate pour les urgences
    speakImmediate(t.emergencyCall);
    toast({
      title: t.sosAlert,
      description: t.sosDescription,
      variant: "destructive"
    });
  };

  const toggleConnection = () => {
    setIsConnected(!isConnected);
    // Utilisation de speak pour les notifications normales
    speak(isConnected ? t.caneDisconnected : t.caneConnected);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
    speak(t.accessibilitySettings);
  };

  const handleLocationClick = () => {
    setShowMap(true);
    speak(t.locationFunction);
  };

  const handleLanguageChange = (value: Language) => {
    setCurrentLanguage(value);
    // Notification du changement de langue
    speak(translations[value].language);
    
    // Avertissement si l'arabe n'est pas supporté
    if (value === 'ar' && !hasArabicSupport) {
      toast({
        title: "Avertissement",
        description: "La synthèse vocale arabe n'est pas disponible sur ce navigateur. Utilisation de l'anglais comme solution de secours.",
        variant: "default"
      });
    }
  };

  return (
    <div className={`min-h-screen bg-logo-gradient p-4 space-y-6 max-w-md mx-auto ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with connection status */}
      <Card className="shadow-lg bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-accessible-xl">
            <div className="flex items-center gap-3">
              <img
                src="/lovable-uploads/4639ae06-bf45-4d47-b954-c7de32a9d311.png"
                alt="CaneConnect Logo"
                className="h-10 w-10 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-white font-bold">{t.appTitle}</span>
                <span className="text-white/80 text-sm font-normal">{t.appSubtitle}</span>
              </div>
            </div>
            <Badge
              variant={isConnected ? "secondary" : "destructive"}
              className="text-accessible-large px-3 py-2"
            >
              {isConnected ? t.connected : t.disconnected}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={toggleConnection}
            variant={isConnected ? "destructive" : "default"}
            className="w-full button-accessible text-accessible-large bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Bluetooth className={`${isRTL ? 'ml-2' : 'mr-2'} h-5 w-5`} />
            {isConnected ? t.disconnect : t.connect}
          </Button>

          {isConnected && (
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <span className="text-accessible-large text-white">{t.battery}</span>
              <Badge variant="secondary" className="text-accessible-large">
                {batteryLevel}%
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SOS Emergency Button */}
      <Card className="shadow-lg border-destructive bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="pt-6">
          <Button
            onClick={handleSOSCall}
            variant="destructive"
            className="w-full button-accessible text-accessible-xl h-20 bg-destructive hover:bg-destructive/90"
          >
            <Phone className={`${isRTL ? 'ml-3' : 'mr-3'} h-8 w-8`} />
            {t.emergencySOS}
          </Button>
          <p className="text-center mt-3 text-muted-foreground text-accessible-large">
            {t.longPressAlert}
          </p>
        </CardContent>
      </Card>

      {/* Map View */}
      {showMap && (
        <Card className="shadow-lg bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-accessible-xl text-white flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              {t.mapTitle}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMap(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <MapComponent />
          </CardContent>
        </Card>
      )}

      {/* Real-time alerts */}
      {isConnected && !showMap && (
        <Card className={`shadow-lg transition-all bg-white/10 backdrop-blur-sm border-white/20 ${isVibrating ? 'ring-4 ring-warning animate-pulse' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accessible-xl text-white">
              <Waves className="h-6 w-6 text-warning" />
              {t.realtimeDetection}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <div className="flex items-center gap-2 p-4 bg-secondary/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-secondary" />
                <span className="text-accessible-large text-white">{t.noObstacle}</span>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-warning/10 border-l-4 border-warning rounded-r-lg">
                    <AlertTriangle className="h-5 w-5 text-warning mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-accessible-large font-medium text-white">{event.description}</p>
                      <p className="text-white/70 text-sm">
                        {event.timestamp.toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {!showMap && (
        <Card className="shadow-lg bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-accessible-xl text-white">{t.quickActions}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="button-accessible text-accessible-large bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => speak(t.historyFunction)}
            >
              <History className={`${isRTL ? 'ml-2' : 'mr-2'} h-5 w-5`} />
              {t.history}
            </Button>
            <Button
              variant="outline"
              className="button-accessible text-accessible-large bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={handleLocationClick}
            >
              <MapPin className={`${isRTL ? 'ml-2' : 'mr-2'} h-5 w-5`} />
              {t.locate}
            </Button>
            <Button
              variant="outline"
              className="button-accessible text-accessible-large bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => speak(t.audioTestSuccess)}
            >
              <Volume2 className={`${isRTL ? 'ml-2' : 'mr-2'} h-5 w-5`} />
              {t.audioTest}
            </Button>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="button-accessible text-accessible-large bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={handleSettingsClick}
                >
                  <Settings className={`${isRTL ? 'ml-2' : 'mr-2'} h-5 w-5`} />
                  {t.settings}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/95 backdrop-blur-sm border-white/20">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Languages className="h-6 w-6" />
                    {t.language}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>                  
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem> 
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartCaneApp;


                   