export interface BaseDatosSupabase {
  public: {
    Tables: {
      pc_builds: {
        Row: {
          id: number;
          user_id: string;
          subtotal: number;
          items: Array<{
            id: string;
            nombre: string;
            precio: number;
            categoria: string;
          }>;
          created_at: string;
        };
        Insert: {
          user_id: string;
          subtotal: number;
          items: Array<{
            id: string;
            nombre: string;
            precio: number;
            categoria: string;
          }>;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          subtotal?: number;
          items?: Array<{
            id: string;
            nombre: string;
            precio: number;
            categoria: string;
          }>;
          created_at?: string;
        };
      };
    };
  };
}
