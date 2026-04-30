// List of universities in Oman
export interface University {
  name: string;
  nameAr: string;
  type: 'public' | 'private';
  location: string;
}

export const omanUniversities: University[] = [
  // Public Universities
  { name: 'Sultan Qaboos University', nameAr: 'جامعة السلطان قابوس', type: 'public', location: 'Muscat' },
  { name: 'University of Technology and Applied Sciences - Muscat', nameAr: 'جامعة التقنية والعلوم التطبيقية - مسقط', type: 'public', location: 'Muscat' },
  { name: 'University of Technology and Applied Sciences - Salalah', nameAr: 'جامعة التقنية والعلوم التطبيقية - صلالة', type: 'public', location: 'Salalah' },
  { name: 'University of Technology and Applied Sciences - Nizwa', nameAr: 'جامعة التقنية والعلوم التطبيقية - نزوى', type: 'public', location: 'Nizwa' },
  { name: 'University of Technology and Applied Sciences - Ibri', nameAr: 'جامعة التقنية والعلوم التطبيقية - عبري', type: 'public', location: 'Ibri' },
  { name: 'University of Technology and Applied Sciences - Sur', nameAr: 'جامعة التقنية والعلوم التطبيقية - صور', type: 'public', location: 'Sur' },
  { name: 'University of Technology and Applied Sciences - Shinas', nameAr: 'جامعة التقنية والعلوم التطبيقية - شناص', type: 'public', location: 'Shinas' },
  { name: 'University of Technology and Applied Sciences - Ibra', nameAr: 'جامعة التقنية والعلوم التطبيقية - إبراء', type: 'public', location: 'Ibra' },
  { name: 'National University of Science and Technology', nameAr: 'جامعة العلوم والتكنولوجيا الوطنية', type: 'public', location: 'Muscat' },
  
  // Private Universities
  { name: 'Dhofar University', nameAr: 'جامعة ظفار', type: 'private', location: 'Salalah' },
  { name: 'Sohar University', nameAr: 'جامعة صحار', type: 'private', location: 'Sohar' },
  { name: 'Nizwa University', nameAr: 'جامعة نزوى', type: 'private', location: 'Nizwa' },
  { name: 'German University of Technology in Oman', nameAr: 'الجامعة الألمانية للتكنولوجيا في عُمان', type: 'private', location: 'Muscat' },
  { name: 'Arab Open University - Oman', nameAr: 'الجامعة العربية المفتوحة - عُمان', type: 'private', location: 'Muscat' },
  { name: 'University of Buraimi', nameAr: 'جامعة البريمي', type: 'private', location: 'Buraimi' },
  { name: 'Al Sharqiyah University', nameAr: 'جامعة الشرقية', type: 'private', location: 'Ibra' },
  { name: 'Muscat University', nameAr: 'جامعة مسقط', type: 'private', location: 'Muscat' },
  { name: 'Middle East College', nameAr: 'كلية الشرق الأوسط', type: 'private', location: 'Muscat' },
  { name: 'Oman College of Management and Technology', nameAr: 'كلية عُمان للإدارة والتكنولوجيا', type: 'private', location: 'Muscat' },
  { name: 'Al Buraimi University College', nameAr: 'كلية البريمي الجامعية', type: 'private', location: 'Buraimi' },
  { name: 'Majan University College', nameAr: 'كلية مجان الجامعية', type: 'private', location: 'Muscat' },
  { name: 'Scientific College of Design', nameAr: 'الكلية العلمية للتصميم', type: 'private', location: 'Muscat' },
  { name: 'Waljat Colleges of Applied Sciences', nameAr: 'كليات والجات للعلوم التطبيقية', type: 'private', location: 'Muscat' },
  { name: 'Oman Tourism College', nameAr: 'كلية عُمان للسياحة', type: 'private', location: 'Muscat' },
  { name: 'Oman Dental College', nameAr: 'كلية عُمان لطب الأسنان', type: 'private', location: 'Muscat' },
  { name: 'Oman Medical College', nameAr: 'كلية عُمان الطبية', type: 'private', location: 'Muscat' },
  { name: 'Sur University College', nameAr: 'كلية صور الجامعية', type: 'private', location: 'Sur' },
  { name: 'Mazoon College', nameAr: 'كلية مزون', type: 'private', location: 'Muscat' },
  { name: 'Modern College of Business and Science', nameAr: 'الكلية الحديثة للتجارة والعلوم', type: 'private', location: 'Muscat' },
  { name: 'Oman College of Health Sciences', nameAr: 'كلية عُمان للعلوم الصحية', type: 'private', location: 'Muscat' },
  { name: 'International Maritime College Oman', nameAr: 'الكلية البحرية الدولية عُمان', type: 'private', location: 'Sohar' },
  { name: 'Caledonian College of Engineering', nameAr: 'الكلية الكاليدونية للهندسة', type: 'private', location: 'Muscat' },
  { name: 'Oman Aviation Academy', nameAr: 'أكاديمية عُمان للطيران', type: 'private', location: 'Muscat' },
  { name: 'Al Zahra College for Women', nameAr: 'كلية الزهراء للبنات', type: 'private', location: 'Muscat' },
];
